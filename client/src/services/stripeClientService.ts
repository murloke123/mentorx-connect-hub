// ##########################################################################################
// ################## STRIPE CLIENT SERVICE - OPERAÇÕES DE CONTA #########################
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço frontend para operações de contas conectadas Stripe
 * 
 * ❓ POR QUE EXISTE: 
 * - Gerenciar criação e atualização de contas conectadas
 * - Verificar status de contas para pagamentos
 * - Nunca chamamos a API da Stripe diretamente do frontend (inseguro)
 * - Este arquivo faz chamadas HTTP para nosso próprio backend
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Frontend (aqui) → Backend (nosso servidor) → Stripe API
 * - FOCO: Apenas operações relacionadas a CONTAS
 * - Para testes de conectividade, use: stripeConnectivityService.ts
 * - Todos os dados sensíveis ficam no backend
 * - Aqui só fazemos fetch() para nossos próprios endpoints
 */

export interface StripeOnboardingData {
  email: string;
  full_name: string;
  phone: string;
  cpf: string;
  date_of_birth: string;
  stripe_account_id?: string | null;
  address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  bank_account: {
    account_type: string;
    routing_number: string;
    branch_number: string;
    account_number: string;
    account_holder_name: string;
  };
  tos_ip?: string;
}

export interface StripeAccountResult {
  success: boolean;
  account?: {
    id: string;
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements?: any;
  };
  error?: string;
}

export interface StripeAccountStatusResult {
  success: boolean;
  account?: any;
  error?: string;
}

// ##########################################################################################
// ###################### SISTEMA DE LOGS PARA DEBUG #####################################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de conta no Network do navegador
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Cada operação de conta gera um log visível no Network do Chrome
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
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silencioso: se o log falhar, não queremos quebrar a operação principal
  }
}

// ##########################################################################################
// ###################### OPERAÇÕES DE CONTA STRIPE ######################################
// ##########################################################################################

/**
 * 🏦 CRIAR/ATUALIZAR CONTA STRIPE
 * 
 * 🎯 OBJETIVO: Criar uma nova conta conectada ou atualizar uma existente
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe dados do usuário (endereço, banco, etc.)
 * 2. Envia tudo para nosso backend via POST /api/stripe/account
 * 3. O backend valida e chama a Stripe API
 * 4. Retorna sucesso/erro para o frontend
 * 
 * 🔄 FLUXO:
 * Frontend → POST /api/stripe/account → Backend → Stripe API → Resposta
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_CREATE_ACCOUNT + PAYLOAD_ENVIADO (dados enviados)
 * - STRIPE_CREATE_ACCOUNT + RESPONSE_RECEBIDO (resposta recebida)
 * - STRIPE_CREATE_ACCOUNT + ERRO_CLIENTE (se der erro)
 */
export async function createOrUpdateStripeConnectedAccount(userData: StripeOnboardingData): Promise<StripeAccountResult> {
  try {
    // 📊 Log: Registra no Network quais dados estamos enviando
    await logToNetworkChrome('STRIPE_CREATE_ACCOUNT', 'PAYLOAD_ENVIADO', userData);

    // 🌐 Chamada HTTP para nosso backend (não diretamente para Stripe!)
    const response = await fetch('/api/stripe/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    // 📊 Log: Registra no Network a resposta que recebemos
    await logToNetworkChrome('STRIPE_CREATE_ACCOUNT', 'RESPONSE_RECEBIDO', {
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

    // ✅ Sucesso: conta criada/atualizada
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_CREATE_ACCOUNT', 'ERRO_CLIENTE', {
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
 * 🔍 VERIFICAR STATUS DA CONTA STRIPE
 * 
 * 🎯 OBJETIVO: Consultar se a conta Stripe está ativa e pode receber pagamentos
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Recebe o ID da conta Stripe
 * 2. Chama GET /api/stripe/account/{id}/status
 * 3. O backend consulta o status na Stripe API
 * 4. Retorna informações sobre charges_enabled, payouts_enabled, etc.
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/account/{id}/status → Backend → Stripe API → Status
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_VERIFY_STATUS + SOLICITACAO_ENVIADA (pedido enviado)
 * - STRIPE_VERIFY_STATUS + RESPONSE_RECEBIDO (status recebido)
 * - STRIPE_VERIFY_STATUS + ERRO_CLIENTE (se der erro)
 */
export async function verifyStripeAccountStatus(accountId: string): Promise<StripeAccountStatusResult> {
  try {
    // 📊 Log: Registra no Network que estamos verificando o status (dashboard)
    await logToNetworkChrome('STRIPE_VERIFY_STATUS', 'SOLICITACAO_ENVIADA', { 
      accountId,
      origem: 'DASHBOARD_AUTO_CHECK',
      timestamp: new Date().toISOString(),
      observacao: 'Verificação automática no carregamento do dashboard do mentor'
    });

    // 🌐 Chamada HTTP para consultar status no backend
    const response = await fetch(`/api/stripe/account/${accountId}/status`);
    const result = await response.json();

    // 📊 Log: Registra no Network a resposta do status com detalhes completos
    await logToNetworkChrome('STRIPE_VERIFY_STATUS', 'RESPONSE_RECEBIDO', {
      status: response.status,
      result: result,
      origem: 'DASHBOARD_AUTO_CHECK',
      resumo_conta: result.account ? {
        charges_enabled: result.account.charges_enabled,
        payouts_enabled: result.account.payouts_enabled,
        details_submitted: result.account.details_submitted,
        requirements_count: result.account.requirements?.currently_due?.length || 0,
        is_fully_active: result.account.charges_enabled && result.account.payouts_enabled
      } : null,
      timestamp: new Date().toISOString(),
      observacao: 'Response do servidor com dados completos da Stripe'
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `Erro HTTP ${response.status}`
      };
    }

    // ✅ Sucesso: status verificado
    return result;

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_VERIFY_STATUS', 'ERRO_CLIENTE', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
} 