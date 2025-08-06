// ##########################################################################################
// ################## APPOINTMENT STRIPE SERVICE - OPERAÇÕES DE AGENDAMENTOS ##############
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço frontend para operações de produtos e preços Stripe para agendamentos
 * 
 * ❓ POR QUE EXISTE: 
 * - Gerenciar criação e atualização de produtos para agendamentos
 * - Criar preços para agendamentos baseados no valor configurado pelo mentor
 * - Nunca chamamos a API da Stripe diretamente do frontend (inseguro)
 * - Este arquivo faz chamadas HTTP para nosso próprio backend
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Frontend (aqui) → Backend (nosso servidor) → Stripe API
 * - FOCO: Apenas operações relacionadas a PRODUTOS E PREÇOS DE AGENDAMENTOS
 * - Para operações de cursos, use: stripeProductService.ts
 * - Para operações de conta, use: stripeClientService.ts
 * - Para documentos, use: stripeDocumentService.ts
 * - Todos os dados sensíveis ficam no backend
 * - Aqui só fazemos fetch() para nossos próprios endpoints
 */

import { clientConfig } from '@/config/environment';
import { supabase } from '@/utils/supabase';

// ##########################################################################################
// ###################### FUNÇÃO DE LOG PARA NETWORK CHROME ##############################
// ##########################################################################################

/**
 * 📊 FUNÇÃO DE LOG PARA NETWORK CHROME
 * 
 * 🎯 OBJETIVO: Registrar eventos de rede no Network tab do Chrome DevTools
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Funciona apenas no desenvolvimento/debug
 * - Ajuda a rastrear chamadas de API e eventos Stripe
 * - Não afeta produção (falha silenciosamente)
 * - Facilita debugging de problemas de integração
 */
async function logToNetworkChrome(type: string, action: string, data: any): Promise<void> {
  try {
    // Só faz log se estivermos em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${type}] ${action}:`, data);
    }
  } catch (error) {
    // Falha silenciosa para não afetar o funcionamento
  }
}

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

export interface AppointmentProductCreateData {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}

export interface AppointmentPriceCreateData {
  product_id: string;
  unit_amount: number; // em centavos
  currency?: string;
  metadata?: Record<string, string>;
}

export interface AppointmentStripeData {
  stripeProductId: string;
  stripePriceId: string;
}

export interface AppointmentInputData {
  mentorId: string;
  mentorName: string;
  menteeName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  price: number; // em reais (será convertido para centavos)
  notes?: string;
}

export interface AppointmentResult {
  success: boolean;
  product?: any;
  error?: string;
}

export interface AppointmentPriceResult {
  success: boolean;
  price?: any;
  error?: string;
}

export interface AppointmentCheckoutParams {
  appointmentId: string;
  buyerId: string;
  buyerEmail: string;
  mentorId: string;
  mentorStripeAccountId: string;
  priceId: string;
  price: number;
}

export interface AppointmentCheckoutResult {
  success: boolean;
  sessionId?: string;
  sessionUrl?: string;
  transactionId?: string;
  error?: string;
}

// ##########################################################################################
// ###################### OPERAÇÕES DE PRODUTOS STRIPE PARA AGENDAMENTOS #################
// ##########################################################################################

/**
 * 🆕 CRIAR PRODUTO STRIPE PARA AGENDAMENTO
 * 
 * 🎯 OBJETIVO: Criar um novo produto no Stripe para um agendamento específico
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do agendamento (mentor, data, hora, valor)
 * 2. Envia tudo para nosso backend via POST /api/stripe/appointments/products
 * 3. O backend valida e chama a Stripe API
 * 4. Retorna sucesso/erro para o frontend
 * 
 * 🔄 FLUXO:
 * Frontend → POST /api/stripe/appointments/products → Backend → Stripe API → Resposta
 */
export async function createAppointmentStripeProduct(
  accountId: string, 
  productData: AppointmentProductCreateData
): Promise<AppointmentResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos enviando
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRODUCT', 'PAYLOAD_ENVIADO', { accountId, productData });

    // 🌐 Chamada HTTP para nosso backend (não diretamente para Stripe!)
    const response = await fetch('/api/stripe/appointments/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, ...productData })
    });

    console.log('🔍 [createAppointmentStripeProduct] Response status:', response.status);
    console.log('🔍 [createAppointmentStripeProduct] Response ok:', response.ok);
    console.log('🔍 [createAppointmentStripeProduct] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Verificar se a resposta é realmente JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ [createAppointmentStripeProduct] Resposta não é JSON:', textResponse);
      throw new Error(`Resposta não é JSON. Content-Type: ${contentType}. Resposta: ${textResponse.substring(0, 200)}...`);
    }

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRODUCT', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: produto criado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRODUCT', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 💰 CRIAR PREÇO STRIPE PARA AGENDAMENTO
 * 
 * 🎯 OBJETIVO: Criar um preço one-time para um agendamento
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do preço (produto, valor em centavos, moeda)
 * 2. Envia para backend via POST /api/stripe/appointments/prices
 * 3. O backend cria o preço na Stripe API
 * 4. Retorna preço criado para uso em checkouts
 */
export async function createAppointmentStripePrice(
  accountId: string, 
  priceData: AppointmentPriceCreateData
): Promise<AppointmentPriceResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos enviando
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRICE', 'PAYLOAD_ENVIADO', { accountId, priceData });

    // 🌐 Chamada HTTP para criar preço no backend
    const response = await fetch('/api/stripe/appointments/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId, ...priceData })
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRICE', 'RESPONSE_RECEBIDO', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: preço criado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('APPOINTMENT_STRIPE_CREATE_PRICE', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * 🎯 CRIAR PRODUTO + PREÇO EM UMA OPERAÇÃO PARA AGENDAMENTO
 * 
 * 🔄 FLUXO OTIMIZADO:
 * 1. Cria produto no Stripe para o agendamento
 * 2. Cria preço one-time vinculado ao produto
 * 3. Retorna ambos os IDs para salvar no banco
 */
export async function createAppointmentStripeProductWithPrice(
  accountId: string,
  appointmentData: AppointmentInputData
): Promise<AppointmentStripeData> {
  try {
    // 📊 Log: Operação combinada iniciada
    await logToNetworkChrome('APPOINTMENT_STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_INICIADA', { 
      accountId, 
      appointmentData 
    });

    // Passo 1: Criar produto para agendamento
    const productResult = await createAppointmentStripeProduct(accountId, {
      name: `Mentoria - ${appointmentData.mentorName} - ${appointmentData.scheduledDate} às ${appointmentData.startTime}`,
      description: `Sessão de mentoria de ${appointmentData.sessionDuration} minutos com ${appointmentData.mentorName} para ${appointmentData.menteeName}`,
      metadata: {
        mentor_id: appointmentData.mentorId,
        mentor_name: appointmentData.mentorName,
        mentee_name: appointmentData.menteeName,
        scheduled_date: appointmentData.scheduledDate,
        start_time: appointmentData.startTime,
        end_time: appointmentData.endTime,
        session_duration: appointmentData.sessionDuration.toString(),
        type: 'appointment'
      }
    });

    if (!productResult.success || !productResult.product) {
      throw new Error(`Erro ao criar produto: ${productResult.error}`);
    }

    // Passo 2: Criar preço para o produto
    const priceResult = await createAppointmentStripePrice(accountId, {
      product_id: productResult.product.id,
      unit_amount: Math.round(appointmentData.price * 100), // Converte para centavos
      currency: 'brl',
      metadata: {
        mentor_id: appointmentData.mentorId,
        scheduled_date: appointmentData.scheduledDate,
        start_time: appointmentData.startTime,
        type: 'appointment'
      }
    });

    if (!priceResult.success || !priceResult.price) {
      throw new Error(`Erro ao criar preço: ${priceResult.error}`);
    }

    const result = {
      stripeProductId: productResult.product.id,
      stripePriceId: priceResult.price.id
    };

    // 📊 Log: Operação combinada bem-sucedida
    await logToNetworkChrome('APPOINTMENT_STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_SUCESSO', result);

    return result;

  } catch (error) {
    await logToNetworkChrome('APPOINTMENT_STRIPE_PRODUCT_WITH_PRICE', 'OPERACAO_ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    throw error;
  }
}

/**
 * 🛒 INICIAR CHECKOUT PARA AGENDAMENTO
 * 
 * 🎯 OBJETIVO: Criar sessão de checkout Stripe para pagamento de agendamento
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do agendamento e usuário
 * 2. Cria produto e preço no Stripe
 * 3. Cria sessão de checkout
 * 4. Registra transação no banco
 * 5. Retorna URL de checkout para redirecionamento
 */
export async function startAppointmentCheckout(
  appointmentData: AppointmentInputData,
  buyerId: string,
  buyerEmail: string
): Promise<AppointmentCheckoutResult> {
  try {
    await logToNetworkChrome('APPOINTMENT_STRIPE_CHECKOUT', 'INICIADO', { 
      appointmentData, 
      buyerId, 
      buyerEmail 
    });

    console.log('🚀 [APPOINTMENT-STRIPE] Iniciando checkout do agendamento:', {
      mentor: appointmentData.mentorName,
      date: appointmentData.scheduledDate,
      price: appointmentData.price,
      buyer: buyerId
    });

    // Buscar conta Stripe do mentor
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', appointmentData.mentorId)
      .single();

    if (mentorError || !mentorProfile?.stripe_account_id) {
      throw new Error('Mentor não possui conta Stripe configurada');
    }

    // Criar produto e preço no Stripe
    const stripeData = await createAppointmentStripeProductWithPrice(
      mentorProfile.stripe_account_id,
      appointmentData
    );

    console.log('✅ [APPOINTMENT-STRIPE] Produto e preço criados:', stripeData);

    // URLs de checkout para agendamentos
    // 🎯 CORREÇÃO CRÍTICA: Adicionar {CHECKOUT_SESSION_ID} para que o Stripe inclua automaticamente o session_id
    const successUrl = `${clientConfig.APP_URL}/appointment-checkout-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientConfig.APP_URL}/`;

    // Criar sessão de checkout
    const response = await fetch('/api/stripe/appointments/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: stripeData.stripePriceId,
        buyerId,
        buyerEmail,
        mentorId: appointmentData.mentorId,
        mentorStripeAccountId: mentorProfile.stripe_account_id,
        appointmentData,
        stripeProductId: stripeData.stripeProductId,
        successUrl,
        cancelUrl
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar sessão de checkout');
    }

    await logToNetworkChrome('APPOINTMENT_STRIPE_CHECKOUT', 'SUCESSO', {
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
      transactionId: result.transactionId
    });

    return {
      success: true,
      sessionId: result.sessionId,
      sessionUrl: result.sessionUrl,
      transactionId: result.transactionId
    };

  } catch (error) {
    await logToNetworkChrome('APPOINTMENT_STRIPE_CHECKOUT', 'ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro no checkout'
    };
  }
}

/**
 * ✅ VERIFICAR SE AGENDAMENTO PODE SER PAGO
 * 
 * 🎯 OBJETIVO: Verificar se o agendamento tem valor > 0 e mentor tem Stripe configurado
 * 
 * 📚 EDUCATIVO:
 * - Agendamentos gratuitos (price = 0) não precisam passar pelo checkout
 * - Agendamentos pagos (price > 0) precisam do Stripe
 * - Mentor deve ter conta Stripe configurada
 */
export async function canProcessAppointmentPayment(
  mentorId: string,
  price: number
): Promise<{ canPay: boolean; reason?: string }> {
  try {
    // Se é gratuito, não precisa de pagamento
    if (price <= 0) {
      return { canPay: false, reason: 'Agendamento gratuito' };
    }

    // Verificar se mentor tem conta Stripe
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select('stripe_account_id, stripe_charges_enabled')
      .eq('id', mentorId)
      .single();

    if (mentorError || !mentorProfile) {
      return { canPay: false, reason: 'Mentor não encontrado' };
    }

    if (!mentorProfile.stripe_account_id) {
      return { canPay: false, reason: 'Mentor não possui conta Stripe configurada' };
    }

    if (!mentorProfile.stripe_charges_enabled) {
      return { canPay: false, reason: 'Mentor não pode receber pagamentos no Stripe' };
    }

    return { canPay: true };

  } catch (error) {
    return { 
      canPay: false, 
      reason: error instanceof Error ? error.message : 'Erro ao verificar pagamento' 
    };
  }
}