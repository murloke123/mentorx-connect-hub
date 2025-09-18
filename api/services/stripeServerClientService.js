import Stripe from 'stripe';
import { config } from '../environment.js';

// ##########################################################################################
// ############ STRIPE SERVER CLIENT SERVICE - OPERAÇÕES DE CONTAS #######################
// ##########################################################################################
// 
// 🎯 RESPONSABILIDADE: Apenas operações relacionadas a contas conectadas Stripe
// 📋 INCLUI: Criação, atualização e verificação de status de contas
// ❌ NÃO INCLUI: Upload/associação de documentos (ver stripeServerDocumentService.js)
//
// 📚 EDUCATIVO PARA DEV JUNIOR:
// - Este serviço executa APENAS no backend/servidor
// - Usa a CHAVE SECRETA do Stripe (nunca exposta ao frontend)
// - Lida com dados sensíveis de contas conectadas
// - Todas as validações e processamentos críticos são feitos aqui
//
// ##########################################################################################

// Inicializar cliente Stripe com chave secreta do servidor
const stripe = new Stripe(config.STRIPE_SECRET_KEY, {
  typescript: true,
});

// ##########################################################################################
// ###################### FUNÇÕES AUXILIARES #############################################
// ##########################################################################################

/**
 * Enviar logs para o Network do Chrome (para debug)
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Esta função envia logs que aparecem no Network tab do Chrome
 * - Útil para debugar operações do Stripe em tempo real
 * - Não afeta o funcionamento, apenas facilita o desenvolvimento
 */
async function logToNetworkChrome(type, action, data) {
  try {
    await fetch('http://localhost:3000/api/stripe-network-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        action, 
        data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silenciar erros de log para não afetar operação principal
  }
}

/**
 * Validar campos obrigatórios do Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Verifica se todos os campos necessários estão presentes
 * - Retorna análise detalhada dos campos faltantes
 * - Ajuda a identificar problemas antes de enviar para Stripe
 */
function validateStripeRequiredFields(accountData) {
  const requiredFields = [
    'country',
    'email',
    'business_type'
  ];
  
  const missingFields = [];
  const analysis = {};
  
  requiredFields.forEach(field => {
    const fieldPath = field.split('.');
    let value = accountData;
    
    for (const path of fieldPath) {
      value = value?.[path];
    }
    
    if (value === undefined || value === null || value === '') {
      missingFields.push(field);
      analysis[field] = 'MISSING';
    } else {
      analysis[field] = 'OK';
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    analysis
  };
}

// ##########################################################################################
// ###################### MÉTODOS DE CONTA CONECTADA #####################################
// ##########################################################################################

/**
 * Verificar status detalhado da conta Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - charges_enabled: Se pode receber pagamentos
 * - payouts_enabled: Se pode receber transfers
 * - details_submitted: Se dados foram enviados
 * - requirements: O que ainda precisa ser completado
 */
export async function verifyStripeAccountStatus(accountId) {
  // 🔍 LOG CONSOLE: Início da verificação
  console.log('🔍 [SERVER-STRIPE] Iniciando verificação de status da conta:', accountId);
  
  await logToNetworkChrome('STRIPE_ACCOUNT', 'VERIFY_STATUS_INICIADO', { accountId });
  
  try {
    console.log('📞 [SERVER-STRIPE] Chamando stripe.accounts.retrieve...');
    const account = await stripe.accounts.retrieve(accountId);
    
    // 🔍 LOG CONSOLE: Response completo da Stripe
    console.log('✅ [SERVER-STRIPE] Response da Stripe recebido:');
    console.log('📊 [SERVER-STRIPE] Account ID:', account.id);
    console.log('📊 [SERVER-STRIPE] Charges enabled:', account.charges_enabled);
    console.log('📊 [SERVER-STRIPE] Payouts enabled:', account.payouts_enabled);
    console.log('📊 [SERVER-STRIPE] Details submitted:', account.details_submitted);
    console.log('📊 [SERVER-STRIPE] Requirements currently due:', account.requirements?.currently_due || []);
    console.log('📊 [SERVER-STRIPE] Requirements past due:', account.requirements?.past_due || []);
    
    const result = {
      success: true,
      account,
      status_detalhado: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          past_due: account.requirements?.past_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          pending_verification: account.requirements?.pending_verification || [],
          errors: account.requirements?.errors || []
        },
        capabilities: {
          card_payments: account.capabilities?.card_payments,
          transfers: account.capabilities?.transfers
        },
        individual: account.individual ? {
          verification_status: account.individual.verification?.status,
          verification_document: !!account.individual.verification?.document?.front
        } : null
      },
      resumo_status: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        verification_pending: account.requirements?.pending_verification?.length || 0,
        requirements_count: account.requirements?.currently_due?.length || 0,
        is_fully_active: account.charges_enabled && account.payouts_enabled && (account.requirements?.currently_due?.length || 0) === 0
      },
      timestamp: new Date().toISOString(),
      observacao: 'DASHBOARD_AUTO_CHECK - Verificação automática no carregamento do dashboard'
    };
    
    await logToNetworkChrome('STRIPE_ACCOUNT', 'VERIFY_STATUS_SUCESSO', {
      accountId,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      verification_pending: account.requirements?.pending_verification?.length || 0,
      requirements_count: account.requirements?.currently_due?.length || 0,
      is_fully_active: account.charges_enabled && account.payouts_enabled && (account.requirements?.currently_due?.length || 0) === 0
    });
    return result;
    
  } catch (error) {
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao verificar conta'
    };
    await logToNetworkChrome('STRIPE_ACCOUNT', 'VERIFY_STATUS_ERRO', { 
      accountId, 
      error: errorResult.error 
    });
    return errorResult;
  }
}

/**
 * Criar ou atualizar conta conectada Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Se stripe_account_id existe: UPDATE (atualizar dados)
 * - Se não existe: CREATE (criar nova conta)
 * - Estratégia 2 etapas: CREATE mínimo + UPDATE completo
 */
export async function createOrUpdateStripeConnectedAccount(userData) {
  const isUpdate = !!userData.stripe_account_id;
  
  await logToNetworkChrome('STRIPE_ACCOUNT', isUpdate ? 'UPDATE_INICIADO' : 'CREATE_INICIADO', { 
    email: userData.email,
    isUpdate,
    hasAccountId: !!userData.stripe_account_id
  });
  
  try {
    let stripeAccount;
    
    if (isUpdate) {
      // Lógica de UPDATE (código simplificado para brevidade)
      stripeAccount = await stripe.accounts.update(userData.stripe_account_id, {
        individual: {
          email: userData.email,
          first_name: userData.full_name.split(' ')[0],
          last_name: userData.full_name.split(' ').slice(1).join(' '),
          phone: userData.phone,
          id_number: userData.cpf,
          dob: {
            day: parseInt(userData.date_of_birth.split('/')[0]),
            month: parseInt(userData.date_of_birth.split('/')[1]),
            year: parseInt(userData.date_of_birth.split('/')[2])
          },
          address: userData.address
        }
      });
    } else {
      // Lógica de CREATE com dados mínimos
      const accountCreateData = {
        country: 'BR',
        email: userData.email,
        business_type: 'individual'
      };
      
      stripeAccount = await stripe.accounts.create(accountCreateData);
    }
    
    await logToNetworkChrome('STRIPE_ACCOUNT', 'CREATE_UPDATE_SUCESSO', { 
      email: userData.email, 
      isUpdate,
      accountId: stripeAccount.id,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled
    });
    
    return stripeAccount;

  } catch (error) {
    await logToNetworkChrome('STRIPE_ACCOUNT', 'CREATE_UPDATE_ERRO', { 
      email: userData.email, 
      isUpdate,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    throw error;
  }
}

export { stripe };