/**
 * 🎯 NOVA FUNÇÃO: Enviar email baseado na ativação da matrícula
 * 
 * Esta função é chamada APENAS quando uma matrícula fica ativa,
 * garantindo que apenas 1 email seja enviado por curso comprado.
 * 
 * Lógica: 1 matrícula ativa = 1 email enviado
 */
async function sendCourseEnrollmentEmail({
  courseId,
  studentId,
  mentorId,
  transactionId
}: {
  courseId: string;
  studentId: string;
  mentorId: string;
  transactionId: string;
}) {
  try {
    console.log('📧 [ENROLLMENT-EMAIL] Iniciando envio de email para matrícula ativa:', {
      courseId,
      studentId,
      mentorId,
      transactionId
    });

    // Verificar se já existe uma matrícula ativa para este curso/estudante
    const { data: activeEnrollment, error: enrollmentError } = await supabase
      .from('matriculas')
      .select('id, email_sent')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single();

    if (enrollmentError) {
      console.error('❌ [ENROLLMENT-EMAIL] Erro ao verificar matrícula:', enrollmentError);
      return;
    }

    // Se email já foi enviado para esta matrícula, pular
    if (activeEnrollment?.email_sent) {
      console.log('✅ [ENROLLMENT-EMAIL] Email já enviado para esta matrícula, pulando...');
      return;
    }

    // Buscar dados necessários
    const [courseData, studentData, mentorData] = await Promise.all([
      supabase.from('cursos').select('title, price').eq('id', courseId).single(),
      supabase.from('profiles').select('full_name').eq('id', studentId).single(),
      supabase.from('profiles').select('full_name, email').eq('id', mentorId).single()
    ]);

    if (!courseData.data || !studentData.data || !mentorData.data) {
      console.error('❌ [ENROLLMENT-EMAIL] Dados incompletos:', {
        course: !!courseData.data,
        student: !!studentData.data,
        mentor: !!mentorData.data
      });
      return;
    }

    // Enviar notificação interna
    await notifyCoursePurchase({
      mentorId,
      mentorName: mentorData.data.full_name,
      buyerId: studentId,
      buyerName: studentData.data.full_name || 'Usuário',
      courseName: courseData.data.title,
      coursePrice: (courseData.data.price || 0) * 100, // converter para centavos
    });

    console.log('✅ [ENROLLMENT-EMAIL] Notificação interna enviada');

    // Enviar email para o mentor
    if (mentorData.data.email) {
      const emailResponse = await fetch('/api/email/course-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorName: mentorData.data.full_name,
          mentorEmail: mentorData.data.email,
          buyerName: studentData.data.full_name || 'Usuário',
          courseName: courseData.data.title,
          coursePrice: courseData.data.price || 0,
          transactionId
        })
      });

      const emailResult = await emailResponse.json();
      
      if (emailResult.success) {
        console.log('✅ [ENROLLMENT-EMAIL] Email enviado para o mentor');
        
        // Marcar email como enviado na matrícula
        await supabase
          .from('matriculas')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', activeEnrollment.id);
          
      } else {
        console.error('❌ [ENROLLMENT-EMAIL] Erro ao enviar email:', emailResult.error);
      }
    }

  } catch (error) {
    console.error('❌ [ENROLLMENT-EMAIL] Erro geral:', error);
  }
}

/**
 * ===============================================================================
 * 💳 STRIPE CHECKOUT SERVICE - Sistema de Pagamentos (Frontend)
 * ===============================================================================
 * 
 * 🎯 OBJETIVO: Gerenciar checkout e pagamentos de cursos via Stripe Connect
 * 
 * 📋 MÉTODOS DISPONÍVEIS:
 * 
 * 🛒 CHECKOUT E SESSÕES:
 * • createCheckoutSession() - Cria sessão de checkout no Stripe
 * • startCourseCheckout() - Inicia processo de compra de curso
 * • handleCheckoutSuccess() - Processa pagamento bem-sucedido
 * • testCheckout() - Teste de funcionalidade de checkout
 * 
 * 🔍 VERIFICAÇÃO DE STATUS:
 * • checkCoursePaymentStatus() - Verifica status de pagamento de curso
 * • checkUserPaymentIntents() - Lista payment intents do usuário
 * • processPendingPayments() - Processa pagamentos pendentes
 * 
 * 📊 TRANSAÇÕES E DADOS:
 * • getUserTransactions() - Lista transações do usuário (comprador/mentor)
 * 
 * 🔧 RECURSOS:
 * • Integração completa com Stripe Connect
 * • Logs detalhados para debug (Network Chrome)
 * • Sistema de transações no banco de dados
 * • Matrículas automáticas após pagamento
 * • Redirecionamento inteligente por role do usuário
 * • Tratamento robusto de erros
 * 
 * 🏦 STRIPE CONNECT:
 * • Pagamentos diretos para conta do mentor
 * • Zero taxa de plataforma (configurável)
 * • Gestão de contas conectadas
 * • Webhooks para confirmação de pagamento
 * 
 * 💡 INTERFACES:
 * • CreateCheckoutSessionParams - Parâmetros de checkout
 * • CheckoutSessionResult - Resultado da sessão
 * • PaymentStatusResult - Status de pagamento
 * 
 * ⚠️ SEGURANÇA:
 * • Todas as operações críticas delegadas ao backend
 * • Nenhuma chave secreta exposta no frontend
 * • Validação dupla: frontend + backend
 * ===============================================================================
 */

import { supabase } from '../utils/supabase';
import { notifyCoursePurchase } from './notificationService';

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

interface CreateCheckoutSessionParams {
  priceId: string;
  courseId: string; 
  buyerId: string;
  buyerEmail: string;
  mentorId: string; // UUID do mentor
  mentorStripeAccountId: string; // Stripe account ID
}

export interface CheckoutSessionResult {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  transactionId?: string;
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
// ###################### SISTEMA DE LOGS PARA DEBUG #####################################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de checkout no Network do navegador
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Cada operação de checkout gera um log visível no Network do Chrome
 * - Facilita debug: você vê exatamente o que foi enviado/recebido
 * - Não polui o console, mas fica registrado no Network
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        action,
        data,
        timestamp: new Date().toISOString(),
        service: 'stripeCheckoutService',
        location: 'frontend'
      })
    });
  } catch (error) {
    // Silencioso: se o log falhar, não queremos quebrar a operação principal
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
 * - Delega criação da sessão para o backend
 * - Cria registro de transação no banco de dados
 * - Gerencia matrícula com status inicial "inactive"
 */
export async function createCheckoutSession({
  priceId,
  courseId,
  buyerId,
  buyerEmail,
  mentorId,
  mentorStripeAccountId
}: CreateCheckoutSessionParams): Promise<CheckoutSessionResult & { transactionId?: string }> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_INICIADO', {
    priceId, courseId, buyerId, mentorId, mentorStripeAccountId
  });

  try {
    console.log('🆕 [CLIENT-STRIPE] Criando sessão de checkout na conta conectada:', mentorStripeAccountId);
    console.log('📦 [CLIENT-STRIPE] Dados da sessão:', {
      priceId, courseId, buyerId
    });

    // Para obter o preço, precisamos primeiro buscar do curso
    const { data: course } = await supabase
      .from('cursos')
      .select('price')
      .eq('id', courseId)
      .single();

    const totalAmount = course?.price || 0;
    const platformFee = 0; // Sem taxa da plataforma
    const mentorAmount = totalAmount;

    // Criar registro inicial da transação no banco
    const { data: transaction, error: transactionError } = await supabase
      .from('stripe_connect_transactions')
      .insert({
        course_id: courseId,
        buyer_id: buyerId,
        mentor_id: mentorId,
        stripe_session_id: '', // Será atualizado após criar a sessão
        stripe_payment_intent_id: null,
        total_amount: totalAmount,
        platform_fee: platformFee,
        mentor_amount: mentorAmount,
        amount: totalAmount * 100, // amount em centavos
        currency: 'brl',
        status: 'pending',
        stripe_account_id: mentorStripeAccountId,
        application_fee_amount: 0, // Sem taxa da plataforma
        metadata: {
          buyer_email: buyerEmail
        }
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error('❌ [CLIENT-STRIPE] Erro ao criar registro de transação:', transactionError);
      throw new Error('Erro ao criar registro de transação');
    }

    // Buscar role do usuário para URLs dinâmicas
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', buyerId)
      .single();

    const userRole = userProfile?.role || 'mentorado';
    const baseUrl = userRole === 'mentor' ? '/mentor/cursos-adquiridos' : '/mentorado/cursos';

    // 🎯 CORREÇÃO CRÍTICA: Chamar backend em vez de Stripe diretamente
    const response = await fetch('/api/stripe/checkout/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: mentorStripeAccountId,
        priceId,
        courseId,
        buyerId,
        buyerEmail,
        mentorId,
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}${baseUrl}?checkout=canceled`
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.error('❌ [CLIENT-STRIPE] Erro ao criar sessão:', result.error);
      throw new Error(result.error || 'Erro ao criar sessão de checkout');
    }

    console.log('✅ [CLIENT-STRIPE] Sessão de checkout criada:', result.sessionId);

    // Atualizar transação com o ID da sessão
    await supabase
      .from('stripe_connect_transactions')
      .update({
        stripe_session_id: result.sessionId,
        metadata: {
          buyer_email: buyerEmail,
          session_url: result.sessionUrl,
          session_created_at: new Date().toISOString()
        }
      })
      .eq('id', transaction.id);

    // Buscar nome do usuário para popular o campo studant_name
    const { data: buyerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', buyerId)
      .single();

    const buyerName = buyerProfile?.full_name || 'Nome não informado';

    // Buscar dados do proprietário do curso (mentor)
    const { data: courseOwner } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', mentorId)
      .single();

    const ownerName = courseOwner?.full_name || 'Mentor não informado';

    // Criar matrícula com status "inactive" (aguardando confirmação de pagamento)
    const { error: enrollmentError } = await supabase
      .from('matriculas')
      .upsert({
        course_id: courseId,
        student_id: buyerId,
        status: 'inactive', // Status inicial como inactive
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        studant_name: buyerName,
        course_owner_id: mentorId,
        course_owner_name: ownerName
      }, {
        onConflict: 'course_id,student_id'
      });

    if (enrollmentError) {
      console.error('❌ [CLIENT-STRIPE] Erro ao criar matrícula inactive:', enrollmentError);
    } else {
      console.log('✅ [CLIENT-STRIPE] Matrícula criada com status inactive (aguardando pagamento)');
    }

    const finalResult = {
      success: true,
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
      transactionId: transaction.id
    };

    await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_SUCESSO', finalResult);

    return finalResult;

  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar sessão de checkout'
    };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'CREATE_SESSION_ERRO', { error: errorResult.error });
    return errorResult;
  }
}

/**
 * Processar sucesso do pagamento
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Verifica sessão no backend (que acessa a conta conectada)
 * - Atualiza transação e ativa matrícula
 * - Usa accountId para verificar na conta conectada correta
 */
export async function handleCheckoutSuccess(sessionId: string, transactionId: string): Promise<{ success: boolean; transaction?: any; error?: string }> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'HANDLE_SUCCESS_INICIADO', { sessionId, transactionId });

  try {
    console.log('🔄 [CLIENT-STRIPE] Processando sucesso do checkout:', { sessionId, transactionId });

    // Primeiro buscar a transação para obter o stripe_account_id
    const { data: transaction, error: fetchError } = await supabase
      .from('stripe_connect_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      throw new Error('Transação não encontrada');
    }

    console.log('📊 [CLIENT-STRIPE] Transação encontrada:', {
      id: transaction.id,
      stripe_account_id: transaction.stripe_account_id,
      status: transaction.status
    });

    // 🛡️ PREVENÇÃO DE DUPLICAÇÃO: Verificar se a transação já foi processada com sucesso
    if (transaction.status === 'succeeded' && transaction.payment_completed_at) {
      console.log('⚠️ [CLIENT-STRIPE] Transação já foi processada anteriormente:', {
        transactionId: transaction.id,
        status: transaction.status,
        paymentCompletedAt: transaction.payment_completed_at
      });
      
      // Retornar sucesso sem reprocessar
      return { success: true, transaction, error: 'Transação já processada' };
    }

    // 🎯 CORREÇÃO CRÍTICA: Verificar sessão no backend usando conta conectada
    const response = await fetch(`/api/stripe/checkout/session/${transaction.stripe_account_id}/${sessionId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro ao verificar sessão');
    }

    const sessionData = result.transaction;
    console.log('📋 [CLIENT-STRIPE] Detalhes da sessão:', {
      id: sessionData.session_id,
      payment_status: sessionData.payment_status,
      amount_total: sessionData.amount_total
    });

    if (sessionData.payment_status !== 'paid') {
      throw new Error('Pagamento não confirmado');
    }

    const paymentIntentId = sessionData.payment_intent_id;
    const amount = sessionData.amount_total || 0;

    console.log('💰 [CLIENT-STRIPE] Detalhes do pagamento:', {
      paymentIntentId,
      amount,
      currency: sessionData.currency
    });

    // Atualizar transação com sucesso
    const { error: updateError } = await supabase
      .from('stripe_connect_transactions')
      .update({
        stripe_payment_intent_id: paymentIntentId,
        amount: amount, // em centavos
        status: 'succeeded',
        payment_completed_at: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          session_id: sessionId,
          payment_intent_id: paymentIntentId,
          payment_completed_at: new Date().toISOString()
        }
      })
      .eq('id', transactionId);

    if (updateError) {
      throw new Error('Erro ao atualizar transação');
    }

    // Criar ou ativar matrícula
    const { data: existingEnrollment } = await supabase
      .from('matriculas')
      .select('*')
      .eq('course_id', transaction.course_id)
      .eq('student_id', transaction.buyer_id)
      .single();

    // Buscar dados necessários para a matrícula e notificação
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', transaction.buyer_id)
      .single();

    const studentName = studentProfile?.full_name || 'Nome não informado';

    // Buscar dados do proprietário do curso (mentor) através da transação
    const { data: courseOwner } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', transaction.mentor_id)
      .single();

    const ownerName = courseOwner?.full_name || 'Mentor não informado';

    // Buscar preço do curso para popular o campo price na matrícula
    const { data: courseData } = await supabase
      .from('cursos')
      .select('price')
      .eq('id', transaction.course_id)
      .single();

    const coursePrice = courseData?.price || 0;

    // 🛡️ PREVENÇÃO DE DUPLICAÇÃO: Verificar se a matrícula já está ativa
    if (existingEnrollment && existingEnrollment.status === 'active') {
      console.log('⚠️ [CLIENT-STRIPE] Matrícula já está ativa, pulando criação/ativação:', {
        enrollmentId: existingEnrollment.id,
        courseId: transaction.course_id,
        studentId: transaction.buyer_id,
        status: existingEnrollment.status
      });
    } else {
      let enrollmentActivated = false;
      
      if (existingEnrollment) {
        // Ativar matrícula existente
        await supabase
          .from('matriculas')
          .update({
            status: 'active',
            enrolled_at: new Date().toISOString(),
            studant_name: studentName,
            course_owner_id: transaction.mentor_id,
            course_owner_name: ownerName,
            price: coursePrice
          })
          .eq('course_id', transaction.course_id)
          .eq('student_id', transaction.buyer_id);
        
        console.log('✅ [CLIENT-STRIPE] Matrícula ativada');
        enrollmentActivated = true;
      } else {
        // Criar nova matrícula
        await supabase
          .from('matriculas')
          .insert({
            course_id: transaction.course_id,
            student_id: transaction.buyer_id,
            status: 'active',
            enrolled_at: new Date().toISOString(),
            progress_percentage: 0,
            studant_name: studentName,
            course_owner_id: transaction.mentor_id,
            course_owner_name: ownerName,
            price: coursePrice
          });
        
        console.log('✅ [CLIENT-STRIPE] Nova matrícula criada');
        enrollmentActivated = true;
      }

      // 🎯 NOVA LÓGICA: Enviar email apenas quando matrícula é ativada
      if (enrollmentActivated) {
        await sendCourseEnrollmentEmail({
          courseId: transaction.course_id,
          studentId: transaction.buyer_id,
          mentorId: transaction.mentor_id,
          transactionId: transaction.id
        });
      }
    }

    const finalResult = { success: true, transaction };
    await logToNetworkChrome('STRIPE_CHECKOUT', 'HANDLE_SUCCESS_SUCESSO', finalResult);

    return finalResult;

  } catch (error) {
    console.error('❌ [CLIENT-STRIPE] Erro ao processar sucesso do checkout:', error);
    
    // Registrar erro na transação
    await supabase
      .from('stripe_connect_transactions')
      .update({
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          failed_at: new Date().toISOString()
        }
      })
      .eq('id', transactionId);
    
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'HANDLE_SUCCESS_ERRO', errorResult);
    
    return errorResult;
  }
}

/**
 * Iniciar checkout de um curso (função simplificada)
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Busca dados do curso e mentor automaticamente
 * - Valida se o mentor tem conta Stripe configurada
 * - Obtém email do usuário automaticamente
 * - Cria sessão de checkout completa
 */
export async function startCourseCheckout(courseId: string, buyerId: string): Promise<CheckoutSessionResult & { transactionId?: string }> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'START_COURSE_CHECKOUT_INICIADO', { courseId, buyerId });

  try {
    console.log('🚀 [CLIENT-STRIPE] Iniciando checkout do curso:', { courseId, buyerId });

    // Buscar informações do curso e do mentor
    const { data: course, error: courseError } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('Curso não encontrado');
    }

    if (!course.stripe_price_id) {
      throw new Error('Curso não possui preço configurado no Stripe');
    }

    // Buscar informações do mentor
    const { data: mentor, error: mentorError } = await supabase
      .from('profiles')
      .select('id, full_name, stripe_account_id')
      .eq('id', course.mentor_id)
      .single();

    if (mentorError || !mentor || !mentor.stripe_account_id) {
      throw new Error('Mentor não possui conta Stripe configurada');
    }

    // Buscar email do comprador - primeiro do Auth, depois do profiles
    let buyerEmail = null;
    
    // Tentar buscar do Supabase Auth primeiro
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user && user.id === buyerId) {
        buyerEmail = user.email;
        console.log('📧 [CLIENT-STRIPE] Email encontrado no Auth:', buyerEmail);
      }
    } catch (authError) {
      console.log('⚠️ [CLIENT-STRIPE] Não foi possível buscar do Auth:', authError);
    }

    // Se não encontrou no Auth, tentar na tabela profiles
    if (!buyerEmail) {
      const { data: buyer, error: buyerError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', buyerId)
        .single();

      if (!buyerError && buyer && buyer.email) {
        buyerEmail = buyer.email;
        console.log('📧 [CLIENT-STRIPE] Email encontrado na tabela profiles:', buyerEmail);
      }
    }

    console.log('🔍 [CLIENT-STRIPE] Resultado da busca de email:', {
      buyerId,
      buyerEmail,
      emailSource: buyerEmail ? 'encontrado' : 'não encontrado'
    });

    if (!buyerEmail) {
      throw new Error('Email do usuário não encontrado. Verifique se o usuário está logado corretamente.');
    }

    // Criar sessão de checkout
    const result = await createCheckoutSession({
      priceId: course.stripe_price_id,
      courseId: courseId,
      buyerId: buyerId,
      buyerEmail: buyerEmail,
      mentorId: course.mentor_id,
      mentorStripeAccountId: mentor.stripe_account_id
    });

    await logToNetworkChrome('STRIPE_CHECKOUT', 'START_COURSE_CHECKOUT_SUCESSO', result);

    return result;

  } catch (error) {
    console.error('❌ [CLIENT-STRIPE] Erro ao iniciar checkout:', error);
    
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'START_COURSE_CHECKOUT_ERRO', errorResult);
    
    return errorResult;
  }
}

/**
 * Verificar status de pagamento de um curso específico
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Busca transação mais recente do usuário para o curso
 * - Se necessário, verifica no backend (conta conectada)
 * - Atualiza status automaticamente se detectar pagamento
 */
export async function checkCoursePaymentStatus(courseId: string, userId: string): Promise<PaymentStatusResult> {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'CHECK_PAYMENT_STATUS_INICIADO', { courseId, userId });

  try {
    console.log('🔍 [CLIENT-STRIPE] Verificando status de pagamento:', { courseId, userId });
    
    // Buscar transação mais recente do usuário para este curso
    const { data: transaction, error } = await supabase
      .from('stripe_connect_transactions')
      .select('*')
      .eq('course_id', courseId)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !transaction) {
      console.log('❌ [CLIENT-STRIPE] Nenhuma transação encontrada para este curso/usuário');
      return { success: true, isPaid: false, status: 'no_transaction' };
    }

    console.log('📊 [CLIENT-STRIPE] Transação encontrada:', {
      id: transaction.id,
      status: transaction.status,
      stripe_session_id: transaction.stripe_session_id,
      stripe_account_id: transaction.stripe_account_id
    });

    // Se já está marcado como sucesso no banco, retornar true
    if (transaction.status === 'succeeded') {
      return { success: true, isPaid: true, status: 'paid' };
    }

    // Se está pendente e tem session_id, verificar no backend
    if (transaction.status === 'pending' && transaction.stripe_session_id && transaction.stripe_account_id) {
      try {
        console.log('🔄 [CLIENT-STRIPE] Verificando sessão no backend...');
        
        // 🎯 CORREÇÃO CRÍTICA: Verificar no backend usando conta conectada
        const response = await fetch(`/api/stripe/checkout/session/${transaction.stripe_account_id}/${transaction.stripe_session_id}`);
        const result = await response.json();

        if (!result.success) {
          console.error('❌ [CLIENT-STRIPE] Erro ao verificar sessão:', result.error);
          return { success: true, isPaid: false, status: 'error' };
        }

        const sessionData = result.transaction;

        console.log('📋 [CLIENT-STRIPE] Status da sessão Stripe:', {
          id: sessionData.session_id,
          payment_status: sessionData.payment_status,
          amount_total: sessionData.amount_total
        });

        if (sessionData.payment_status === 'paid') {
          // Atualizar transação e ativar matrícula
          console.log('✅ [CLIENT-STRIPE] Pagamento confirmado! Atualizando registros...');
          await handleCheckoutSuccess(transaction.stripe_session_id, transaction.id);
          return { success: true, isPaid: true, status: 'paid' };
        } else {
          return { success: true, isPaid: false, status: 'pending' };
        }
      } catch (error: any) {
        console.error('❌ [CLIENT-STRIPE] Erro ao verificar sessão no backend:', error);
        return { success: true, isPaid: false, status: 'error' };
      }
    }

    // Se chegou aqui, a transação está em um estado não esperado
    return { success: true, isPaid: false, status: transaction.status };

  } catch (error) {
    console.error('❌ [CLIENT-STRIPE] Erro ao verificar status de pagamento:', error);
    
    const errorResult = {
      success: false,
      isPaid: false,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    };
    
    await logToNetworkChrome('STRIPE_CHECKOUT', 'CHECK_PAYMENT_STATUS_ERRO', errorResult);
    
    return errorResult;
  }
}

/**
 * Verificar payment intents de um usuário específico
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Delega verificação para o backend que acessa as contas conectadas
 * - Atualiza transações automaticamente quando detecta pagamentos
 * - Usa o padrão cliente/servidor estabelecido
 */
export async function checkUserPaymentIntents(userId: string, userEmail: string) {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'CHECK_USER_PAYMENT_INTENTS_INICIADO', { userId, userEmail });

  try {
    console.log('🔍 [CLIENT-STRIPE] Verificando payment intents para usuário:', {
      userId,
      userEmail
    });

    // Buscar todas as transações do usuário
    const { data: transactions, error } = await supabase
      .from('stripe_connect_transactions')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CLIENT-STRIPE] Erro ao buscar transações:', error);
      return;
    }

    if (!transactions || transactions.length === 0) {
      console.log('❌ [CLIENT-STRIPE] Nenhuma transação encontrada para o usuário');
      return;
    }

    console.log(`🔍 [CLIENT-STRIPE] Encontradas ${transactions.length} transações:`, transactions);

    // Verificar cada transação via backend
    for (const transaction of transactions) {
      console.log(`\n🔄 [CLIENT-STRIPE] Processando transação:`, {
        id: transaction.id,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        stripe_account_id: transaction.stripe_account_id,
        status: transaction.status
      });

      if (!transaction.stripe_payment_intent_id || !transaction.stripe_account_id) {
        console.log('⚠️ [CLIENT-STRIPE] Transação sem payment_intent_id ou account_id');
        continue;
      }

      try {
        // 🎯 CORREÇÃO CRÍTICA: Verificar via backend usando conta conectada
        const response = await fetch(`/api/stripe/checkout/payment/${transaction.stripe_account_id}/${transaction.stripe_payment_intent_id}`);
        const result = await response.json();

        if (!result.success) {
          console.error('❌ [CLIENT-STRIPE] Erro ao verificar payment intent:', result.error);
          continue;
        }

        console.log('📥 [CLIENT-STRIPE] Resposta do backend:', result.transaction);

        // Verificar status do payment intent
        if (result.isPaid && result.transaction?.status === 'succeeded') {
          console.log('✅ [CLIENT-STRIPE] Payment Intent confirmado como pago!');
          
          // Atualizar transação no banco
          await supabase
            .from('stripe_connect_transactions')
            .update({
              status: 'succeeded',
              payment_completed_at: new Date().toISOString(),
              metadata: {
                ...transaction.metadata,
                payment_intent_verified_at: new Date().toISOString(),
                payment_intent_status: result.transaction.status,
                payment_intent_amount: result.transaction.amount,
                payment_intent_currency: result.transaction.currency
              }
            })
            .eq('id', transaction.id);

          // Ativar matrícula
          await supabase
            .from('matriculas')
            .upsert({
              course_id: transaction.course_id,
              student_id: transaction.buyer_id,
              status: 'active',
              enrolled_at: new Date().toISOString(),
              progress_percentage: 0
            }, {
              onConflict: 'course_id,student_id'
            });

          console.log('✅ [CLIENT-STRIPE] Transação e matrícula atualizadas!');
        } else {
          console.log('⏳ [CLIENT-STRIPE] Payment Intent ainda não pago:', result.status);
        }

      } catch (error: any) {
        console.error('❌ [CLIENT-STRIPE] Erro ao verificar payment intent via backend:', error);
      }
    }

    await logToNetworkChrome('STRIPE_CHECKOUT', 'CHECK_USER_PAYMENT_INTENTS_SUCESSO', { userId, verificadas: transactions.length });

  } catch (error) {
    console.error('❌ [CLIENT-STRIPE] Erro geral ao verificar payment intents:', error);
    await logToNetworkChrome('STRIPE_CHECKOUT', 'CHECK_USER_PAYMENT_INTENTS_ERRO', { userId, error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Verificar e processar pagamentos pendentes
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Busca transações pendentes dos últimos períodos
 * - Verifica status via backend (conta conectada)
 * - Atualiza status automaticamente se detectar pagamentos
 * - Marca como falhadas se sessões expiraram
 */
export async function processPendingPayments() {
  await logToNetworkChrome('STRIPE_CHECKOUT', 'PROCESS_PENDING_PAYMENTS_INICIADO', {});

  try {
    console.log('🔄 [CLIENT-STRIPE] Verificando pagamentos pendentes...');
    
    // Buscar transações pendentes e falhadas das últimas 2 horas
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingTransactions, error } = await supabase
      .from('stripe_connect_transactions')
      .select('*')
      .in('status', ['pending', 'failed']) // Incluir failed também
      .gte('created_at', twoHoursAgo) // Aumentar janela de tempo
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CLIENT-STRIPE] Erro ao buscar transações pendentes:', error);
      return;
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('✅ [CLIENT-STRIPE] Nenhuma transação pendente encontrada');
      return;
    }

    console.log(`🔍 [CLIENT-STRIPE] Encontradas ${pendingTransactions.length} transações para verificar:`, 
      pendingTransactions.map(t => ({ id: t.id, status: t.status, session_id: t.stripe_session_id }))
    );

    // Verificar cada transação via backend
    for (const transaction of pendingTransactions) {
      try {
        if (!transaction.stripe_session_id) {
          console.log(`⚠️ [CLIENT-STRIPE] Transação ${transaction.id} sem session_id`);
          continue;
        }

        if (!transaction.stripe_account_id) {
          console.log(`⚠️ [CLIENT-STRIPE] Transação ${transaction.id} sem stripe_account_id`);
          continue;
        }

        console.log(`🔍 [CLIENT-STRIPE] Verificando sessão ${transaction.stripe_session_id} na conta ${transaction.stripe_account_id}`);

        // 🎯 CORREÇÃO CRÍTICA: Verificar sessão via backend usando conta conectada
        const response = await fetch(`/api/stripe/checkout/session/${transaction.stripe_account_id}/${transaction.stripe_session_id}`);
        const result = await response.json();

        if (!result.success) {
          console.error(`❌ [CLIENT-STRIPE] Erro ao verificar sessão ${transaction.stripe_session_id}:`, result.error);
          
          // Se a sessão não existe mais (404), marcar como falhada
          if (response.status === 404) {
            console.log(`🗑️ [CLIENT-STRIPE] Sessão ${transaction.stripe_session_id} não existe mais no Stripe`);
            await supabase
              .from('stripe_connect_transactions')
              .update({
                status: 'failed',
                metadata: {
                  ...transaction.metadata,
                  error: 'Session not found in Stripe',
                  timestamp: new Date().toISOString()
                }
              })
              .eq('id', transaction.id);
          }
          continue;
        }

        const sessionData = result.transaction;
        
        console.log(`📋 [CLIENT-STRIPE] Sessão ${sessionData.session_id}:`, {
          payment_status: sessionData.payment_status,
          amount_total: sessionData.amount_total,
          currency: sessionData.currency,
          customer_email: sessionData.customer_email
        });

        if (sessionData.payment_status === 'paid') {
          console.log(`✅ [CLIENT-STRIPE] Pagamento confirmado para transação ${transaction.id}`);
          await handleCheckoutSuccess(sessionData.session_id, transaction.id);
        } else {
          console.log(`⏳ [CLIENT-STRIPE] Sessão ainda pendente: ${sessionData.payment_status}`);
          // Se estava marcada como failed mas ainda está válida, voltar para pending
          if (transaction.status === 'failed') {
            await supabase
              .from('stripe_connect_transactions')
              .update({ status: 'pending' })
              .eq('id', transaction.id);
          }
        }
      } catch (error: any) {
        console.error(`❌ [CLIENT-STRIPE] Erro ao verificar transação ${transaction.id}:`, error);
      }
    }

    await logToNetworkChrome('STRIPE_CHECKOUT', 'PROCESS_PENDING_PAYMENTS_SUCESSO', { verificadas: pendingTransactions.length });

  } catch (error) {
    console.error('❌ [CLIENT-STRIPE] Erro geral ao processar pagamentos pendentes:', error);
    await logToNetworkChrome('STRIPE_CHECKOUT', 'PROCESS_PENDING_PAYMENTS_ERRO', { error: error instanceof Error ? error.message : String(error) });
  }
}

// ##########################################################################################
// ###################### FUNÇÕES UTILITÁRIAS ############################################
// ##########################################################################################

/**
 * Listar transações do usuário
 */
export async function getUserTransactions(userId: string, role: 'buyer' | 'mentor') {
  try {
    const query = supabase
      .from('stripe_connect_transactions')
      .select(`
        *,
        course:cursos!course_id (
          id,
          title,
          image_url
        ),
        buyer:buyer_id (
          id,
          full_name,
          email
        ),
        mentor:mentor_id (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (role === 'buyer') {
      query.eq('buyer_id', userId);
    } else {
      query.eq('mentor_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

// Função para simular checkout de teste
export async function testCheckout() {
  try {
    console.log('🧪 Iniciando teste de checkout...');
    
    // Dados do cenário de teste
    const testData = {
      mentorEmail: 'toninho@teste.com',
      mentorStripeAccountId: 'acct_1RccedRGx7Up4HIL',
      productId: 'prod_SXivFADSHzZTWa',
      buyerEmail: 'gabriela@teste.com'
    };

    console.log('📊 Dados do teste:', testData);

    // Para teste, vamos usar o startCourseCheckout para um curso de teste
    // Em produção, isso seria feito através do startCourseCheckout normal
    const result = await startCourseCheckout('test-course-id', 'test-buyer-id');

    if (!result.success) {
      throw new Error(result.error || 'Erro no teste de checkout');
    }

    console.log('✅ Teste concluído com sucesso!');
    console.log('🔗 URL do checkout:', result.sessionUrl);
    
    return result;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}