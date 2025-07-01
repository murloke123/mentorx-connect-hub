import Stripe from 'stripe';
import config from '../environment';
import { supabase } from '../storage';

// Instância do Stripe usando configuração do servidor
const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// ##########################################################################################
// ############ SISTEMA DE LOGS PARA NETWORK DO CHROME - BACKEND ########################
// ##########################################################################################

/**
 * Log para debug de operações de webhook
 * @@@@@@@@ EXECUTADO DO LADO BACKEND @@@@@@@@
 */
const logWebhookOperation = (operation: string, data: any, result?: any, error?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 [${timestamp}] STRIPE_WEBHOOK_${operation.toUpperCase()}:`, {
    operation,
    data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
    result: result ? JSON.stringify(result, null, 2) : undefined,
    error: error?.message || error,
    service: 'stripeServerWebhookService'
  });
};

// Handler principal para processar eventos do webhook
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean }> {
  let event: Stripe.Event;

  try {
    logWebhookOperation('VERIFY_SIGNATURE', { 
      signatureLength: signature.length,
      payloadType: typeof payload,
      payloadSize: payload.length 
    });

    // Verificar a assinatura do webhook
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.STRIPE_WEBHOOK_SECRET
    );

    logWebhookOperation('EVENT_VERIFIED', { 
      eventId: event.id,
      eventType: event.type,
      created: event.created 
    });

  } catch (err: any) {
    const error = `Webhook Error: ${err.message}`;
    logWebhookOperation('VERIFY_SIGNATURE', { signature }, null, error);
    throw new Error(error);
  }

  console.log(`📥 Evento recebido: ${event.type}`);

  // Processar eventos específicos
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'transfer.created':
      await handleTransferCreated(event.data.object as Stripe.Transfer);
      break;

    case 'transfer.updated':
      await handleTransferUpdated(event.data.object as Stripe.Transfer);
      break;

    default:
      console.log(`⚠️ Evento não tratado: ${event.type}`);
  }

  logWebhookOperation('EVENT_PROCESSED', { eventType: event.type }, { received: true });

  return { received: true };
}

// Handler para checkout.session.completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logWebhookOperation('CHECKOUT_COMPLETED', { sessionId: session.id });

  try {
    // Buscar transação pelo session_id
    const { data: transaction, error } = await supabase
      .from('stripe_connect_transactions')
      .select('*')
      .eq('stripe_session_id', session.id)
      .single();

    if (error || !transaction) {
      const errorMsg = 'Transação não encontrada para session: ' + session.id;
      logWebhookOperation('CHECKOUT_COMPLETED', { sessionId: session.id }, null, errorMsg);
      return;
    }

    // Atualizar transação com informações do pagamento
    const updateData = {
      stripe_payment_intent_id: session.payment_intent as string,
      amount: session.amount_total || 0,
      status: 'succeeded',
      metadata: {
        ...transaction.metadata,
        checkout_completed_at: new Date().toISOString(),
        customer_email: session.customer_email,
        payment_status: session.payment_status
      }
    };

    await supabase
      .from('stripe_connect_transactions')
      .update(updateData)
      .eq('id', transaction.id);

    // Ativar matrícula do aluno
    const enrollmentData = {
      course_id: transaction.course_id,
      student_id: transaction.buyer_id,
      status: 'active',
      enrolled_at: new Date().toISOString(),
      progress_percentage: 0
    };

    const { error: enrollmentError } = await supabase
      .from('matriculas')
      .upsert(enrollmentData, {
        onConflict: 'course_id,student_id'
      });

    if (enrollmentError) {
      logWebhookOperation('CHECKOUT_COMPLETED', { sessionId: session.id }, null, 'Erro ao criar/atualizar matrícula: ' + enrollmentError.message);
    } else {
      logWebhookOperation('ENROLLMENT_ACTIVATED', { courseId: transaction.course_id, studentId: transaction.buyer_id });
    }

    // Notificar o mentor sobre a nova venda
    await notifyMentorNewSale(transaction);

    logWebhookOperation('CHECKOUT_COMPLETED', { sessionId: session.id }, { transactionUpdated: true, enrollmentActivated: true });

  } catch (error) {
    logWebhookOperation('CHECKOUT_COMPLETED', { sessionId: session.id }, null, error);
  }
}

// Handler para payment_intent.succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logWebhookOperation('PAYMENT_SUCCEEDED', { paymentIntentId: paymentIntent.id });

  // Buscar transação pelo payment_intent_id
  const { data: transaction } = await supabase
    .from('stripe_connect_transactions')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (transaction) {
    const updateData = {
      status: 'succeeded',
      payment_completed_at: new Date().toISOString(),
      metadata: {
        ...transaction.metadata,
        payment_method: paymentIntent.payment_method,
        amount_received: paymentIntent.amount_received
      }
    };

    await supabase
      .from('stripe_connect_transactions')
      .update(updateData)
      .eq('id', transaction.id);

    logWebhookOperation('PAYMENT_SUCCEEDED', { paymentIntentId: paymentIntent.id }, { transactionUpdated: true });
  }
}

// Handler para payment_intent.payment_failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logWebhookOperation('PAYMENT_FAILED', { paymentIntentId: paymentIntent.id });

  const { data: transaction } = await supabase
    .from('stripe_connect_transactions')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (transaction) {
    const updateData = {
      status: 'failed',
      error_log: {
        ...transaction.error_log,
        payment_failed_at: new Date().toISOString(),
        failure_message: paymentIntent.last_payment_error?.message
      }
    };

    await supabase
      .from('stripe_connect_transactions')
      .update(updateData)
      .eq('id', transaction.id);

    // Suspender matrícula se existir
    await supabase
      .from('matriculas')
      .update({ status: 'suspended' })
      .eq('course_id', transaction.course_id)
      .eq('student_id', transaction.buyer_id);

    logWebhookOperation('PAYMENT_FAILED', { paymentIntentId: paymentIntent.id }, { transactionUpdated: true, enrollmentSuspended: true });
  }
}

// Handler para transfer.created
async function handleTransferCreated(transfer: Stripe.Transfer) {
  logWebhookOperation('TRANSFER_CREATED', { transferId: transfer.id });

  // Buscar transação pelos metadados
  const transactionId = transfer.metadata?.transaction_id;
  if (transactionId) {
    const updateData = {
      stripe_transfer_id: transfer.id,
      transfer_status: 'pending',
      metadata: {
        transfer_created_at: new Date().toISOString(),
        transfer_amount: transfer.amount,
        transfer_destination: transfer.destination
      }
    };

    await supabase
      .from('stripe_connect_transactions')
      .update(updateData)
      .eq('id', transactionId);

    logWebhookOperation('TRANSFER_CREATED', { transferId: transfer.id }, { transactionUpdated: true });
  }
}

// Handler para transfer.updated
async function handleTransferUpdated(transfer: Stripe.Transfer) {
  logWebhookOperation('TRANSFER_UPDATED', { transferId: transfer.id });

  const { data: transaction } = await supabase
    .from('stripe_connect_transactions')
    .select('*')
    .eq('stripe_transfer_id', transfer.id)
    .single();

  if (transaction) {
    const transferStatus = transfer.reversed ? 'reversed' : 'completed';
    
    const updateData = {
      transfer_status: transferStatus,
      transfer_completed_at: new Date().toISOString(),
      metadata: {
        ...transaction.metadata,
        transfer_updated_at: new Date().toISOString()
      }
    };

    await supabase
      .from('stripe_connect_transactions')
      .update(updateData)
      .eq('id', transaction.id);

    logWebhookOperation('TRANSFER_UPDATED', { transferId: transfer.id }, { transactionUpdated: true, status: transferStatus });
  }
}

// Função auxiliar para notificar o mentor sobre nova venda
async function notifyMentorNewSale(transaction: any) {
  try {
    logWebhookOperation('NOTIFY_MENTOR', { transactionId: transaction.id });

    // Buscar informações do curso
    const { data: course } = await supabase
      .from('cursos')
      .select('title, mentor_id')
      .eq('id', transaction.course_id)
      .single();

    if (!course?.mentor_id) return;

    // Criar notificação no banco
    const notificationData = {
      user_id: course.mentor_id,
      title: 'Nova venda realizada! 🎉',
      message: `Parabéns! Você vendeu o curso "${course.title}". Valor: R$ ${(transaction.amount / 100).toFixed(2)}`,
      type: 'sale',
      is_read: false,
      metadata: {
        course_id: transaction.course_id,
        transaction_id: transaction.id,
        amount: transaction.amount
      }
    };

    await supabase
      .from('notifications')
      .insert(notificationData);

    logWebhookOperation('NOTIFY_MENTOR', { transactionId: transaction.id }, { notificationSent: true });

  } catch (error) {
    logWebhookOperation('NOTIFY_MENTOR', { transactionId: transaction.id }, null, error);
  }
} 