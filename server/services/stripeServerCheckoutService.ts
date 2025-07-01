import Stripe from "stripe";
import { config } from '../environment';

// ##########################################################################################
// ############ STRIPE SERVER CHECKOUT SERVICE - OPERAÇÕES DE CHECKOUT ###################
// ##########################################################################################
// 
// 🎯 RESPONSABILIDADE: Apenas operações relacionadas a checkout e sessões Stripe
// 📋 INCLUI: Criação de sessões, processamento de sucessos, verificação de status
// ❌ NÃO INCLUI: Webhooks (ver stripePaymentsService.ts) ou produtos (ver stripeServerProductService.ts)
//
// 📚 EDUCATIVO PARA DEV JUNIOR:
// - Este serviço executa APENAS no backend/servidor
// - Usa a CHAVE SECRETA do Stripe (nunca exposta ao frontend)
// - Lida com sessões de checkout e transações monetárias
// - Todas as validações e processamentos críticos são feitos aqui
//
// ##########################################################################################

// Inicializar cliente Stripe com chave secreta do servidor
const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

export interface CreateCheckoutSessionData {
  accountId: string;
  priceId: string;
  courseId: string;
  buyerId: string;
  buyerEmail: string;
  mentorId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface CheckoutSuccessData {
  sessionId: string;
  transactionId: string;
  accountId: string;
}

export interface CheckoutSuccessResult {
  success: boolean;
  transaction?: any;
  error?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  isPaid: boolean;
  status: string;
  transaction?: any;
  error?: string;
}

// ##########################################################################################
// ################ SISTEMA DE LOGS PARA NETWORK DO CHROME ###############################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de checkout no Network do navegador
 * 
 * 📚 EDUCATIVO: Logs aparecem na aba Network do DevTools para debug
 * 
 * 🔍 COMO VER OS LOGS:
 * 1. Abra Chrome DevTools (F12)
 * 2. Vá na aba "Network" 
 * 3. Procure por requisições "/api/stripe-network-logs"
 * 4. Clique para ver os dados enviados
 */
async function logToNetworkChrome(type: string, action: string, data: any): Promise<void> {
  try {
    await fetch('/api/stripe-network-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        action,
        data,
        timestamp: new Date().toISOString(),
        service: 'stripeServerCheckoutService',
        location: 'backend'
      })
    });
  } catch (error) {
    // Falha silenciosa - logs não devem quebrar o fluxo
  }
}

// ##########################################################################################
// ###################### MÉTODOS DE CHECKOUT ############################################
// ##########################################################################################

/**
 * Criar sessão de checkout no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - accountId: ID da conta conectada do mentor (obrigatório)
 * - priceId: ID do preço Stripe do curso (obrigatório)
 * - Sessões são criadas na conta conectada específica
 * - URLs de sucesso/cancelamento são personalizáveis
 */
export async function createStripeCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResult> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_INICIADO', data);
  
  try {
    console.log('🆕 [SERVER-STRIPE] Criando sessão de checkout na conta conectada:', data.accountId);
    console.log('📦 [SERVER-STRIPE] Dados da sessão:', {
      priceId: data.priceId,
      courseId: data.courseId,
      buyerId: data.buyerId
    });
    
    // Preparar parâmetros para criar sessão de checkout
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{
        price: data.priceId,
        quantity: 1
      }],
      mode: 'payment',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      customer_email: data.buyerEmail,
      metadata: {
        course_id: data.courseId,
        buyer_id: data.buyerId,
        mentor_id: data.mentorId
      },
      locale: 'pt-BR' as const
    };

    // 🎯 CORREÇÃO CRÍTICA: Criar sessão na conta conectada específica
    const session = await stripe.checkout.sessions.create(sessionParams, {
      stripeAccount: data.accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Sessão de checkout criada na conta conectada:', session.id);
    
    const result = {
      success: true,
      sessionId: session.id,
      sessionUrl: session.url || undefined,
      transactionId: undefined // Será preenchido pelo frontend quando criar a transação
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_SUCESSO', {
      account_id: data.accountId,
      session_id: session.id,
      session_url: session.url,
      course_id: data.courseId,
      buyer_id: data.buyerId
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar sessão de checkout'
    };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_ERRO', { 
      accountId: data.accountId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Verificar sessão de checkout no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - accountId: ID da conta conectada onde a sessão foi criada (obrigatório)
 * - sessionId: ID da sessão de checkout (obrigatório)
 * - Retorna detalhes completos da sessão incluindo payment_intent
 */
export async function verifyStripeCheckoutSession(accountId: string, sessionId: string): Promise<CheckoutSuccessResult> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_SESSION_INICIADO', { accountId, sessionId });
  
  try {
    console.log('🔍 [SERVER-STRIPE] Verificando sessão na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Session ID:', sessionId);
    
    // 🎯 CORREÇÃO CRÍTICA: Verificar sessão na conta conectada específica
    const session = await stripe.checkout.sessions.retrieve(
      sessionId, 
      {
        expand: ['payment_intent', 'line_items']
      },
      {
        stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
      }
    );
    
    console.log('✅ [SERVER-STRIPE] Sessão verificada:', {
      id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total
    });
    
    const result = {
      success: true,
      transaction: {
        session_id: session.id,
        payment_status: session.payment_status,
        payment_intent_id: typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        metadata: session.metadata
      }
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_SESSION_SUCESSO', {
      account_id: accountId,
      session_id: session.id,
      payment_status: session.payment_status,
      amount_total: session.amount_total
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar sessão de checkout'
    };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_SESSION_ERRO', { 
      accountId, 
      sessionId,
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Verificar status de pagamento específico
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - accountId: ID da conta conectada (obrigatório)
 * - paymentIntentId: ID do payment intent (obrigatório)
 * - Verifica se o pagamento foi processado com sucesso
 */
export async function verifyStripePaymentStatus(accountId: string, paymentIntentId: string): Promise<PaymentStatusResult> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_PAYMENT_INICIADO', { accountId, paymentIntentId });
  
  try {
    console.log('💰 [SERVER-STRIPE] Verificando payment intent na conta conectada:', accountId);
    console.log('📦 [SERVER-STRIPE] Payment Intent ID:', paymentIntentId);
    
    // 🎯 CORREÇÃO CRÍTICA: Verificar payment intent na conta conectada específica
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {}, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log('✅ [SERVER-STRIPE] Payment intent verificado:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });
    
    const isPaid = paymentIntent.status === 'succeeded';
    
    const result = {
      success: true,
      isPaid,
      status: paymentIntent.status,
      transaction: {
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata
      }
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_PAYMENT_SUCESSO', {
      account_id: accountId,
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      is_paid: isPaid,
      amount: paymentIntent.amount
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      isPaid: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar payment intent'
    };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'VERIFY_PAYMENT_ERRO', { 
      accountId, 
      paymentIntentId,
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Listar sessões de checkout de uma conta
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - accountId: ID da conta conectada (obrigatório)
 * - Lista todas as sessões de checkout criadas na conta
 * - Útil para auditoria e debug
 */
export async function listStripeCheckoutSessions(accountId: string, options: { limit?: number } = {}): Promise<{ success: boolean; sessions?: Stripe.Checkout.Session[]; error?: string }> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'LIST_SESSIONS_INICIADO', { accountId, options });
  
  try {
    console.log('📋 [SERVER-STRIPE] Listando sessões de checkout da conta conectada:', accountId);
    
    // 🎯 CORREÇÃO CRÍTICA: Listar sessões na conta conectada específica
    const sessions = await stripe.checkout.sessions.list({
      limit: options.limit || 100
    }, {
      stripeAccount: accountId  // 🔥 ESSENCIAL: Especificar conta conectada
    });
    
    console.log(`✅ [SERVER-STRIPE] ${sessions.data.length} sessões encontradas na conta conectada`);
    
    const result = { success: true, sessions: sessions.data };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'LIST_SESSIONS_SUCESSO', {
      account_id: accountId,
      count: sessions.data.length,
      sessions: sessions.data.map(s => ({ 
        id: s.id, 
        payment_status: s.payment_status,
        amount_total: s.amount_total 
      }))
    });
    
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao listar sessões de checkout'
    };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'LIST_SESSIONS_ERRO', { 
      accountId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

export { stripe };
