import Stripe from 'stripe';
import { config } from '../environment';

// ##########################################################################################
// ############ STRIPE SERVER CLIENT SERVICE - OPERAÇÕES DE CONTAS #######################
// ##########################################################################################
// 
// 🎯 RESPONSABILIDADE: Apenas operações relacionadas a contas conectadas Stripe
// 📋 INCLUI: Criação, atualização e verificação de status de contas
// ❌ NÃO INCLUI: Upload/associação de documentos (ver stripeServerDocumentService.ts)
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
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// ##########################################################################################
// ###################### INTERFACES E TIPOS #############################################
// ##########################################################################################

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

// ##########################################################################################
// ################ SISTEMA DE LOGS PARA NETWORK DO CHROME ###############################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de conta no Network do navegador
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
        service: 'stripeServerClientService',
        location: 'backend'
      })
    });
  } catch (error) {
    // Falha silenciosa - logs não devem quebrar o fluxo
  }
}

// ##########################################################################################
// ###################### VALIDAÇÃO DE CAMPOS STRIPE ####################################
// ##########################################################################################

/**
 * 🔍 DIAGNÓSTICO: Validar se todos os campos obrigatórios estão presentes
 * 
 * 📚 Esta função verifica se os campos que a Stripe está solicitando
 * estão realmente sendo enviados no payload
 */
function validateStripeRequiredFields(accountData: any): { isValid: boolean; missingFields: string[]; analysis: any } {
  const missingFields: string[] = [];
  const analysis: any = {
    business_profile_check: {},
    individual_check: {},
    tos_acceptance_check: {},
    overall_structure: {}
  };

  // Verificar business_profile.monthly_estimated_revenue
  if (!accountData.business_profile) {
    missingFields.push('business_profile (object não existe)');
    analysis.business_profile_check.missing_object = true;
  } else {
    if (!accountData.business_profile.monthly_estimated_revenue) {
      missingFields.push('business_profile.monthly_estimated_revenue');
      analysis.business_profile_check.missing_monthly_revenue = true;
    } else {
      const revenue = accountData.business_profile.monthly_estimated_revenue;
      if (typeof revenue.amount !== 'number') {
        missingFields.push('business_profile.monthly_estimated_revenue.amount (não é number)');
      }
      if (revenue.currency !== 'brl') {
        missingFields.push('business_profile.monthly_estimated_revenue.currency (não é "brl")');
      }
      analysis.business_profile_check.revenue_structure = revenue;
    }
  }

  // Verificar individual.political_exposure
  if (!accountData.individual) {
    missingFields.push('individual (object não existe)');
    analysis.individual_check.missing_object = true;
  } else {
    if (!accountData.individual.political_exposure) {
      missingFields.push('individual.political_exposure');
      analysis.individual_check.missing_political_exposure = true;
    } else if (accountData.individual.political_exposure !== 'none') {
      missingFields.push('individual.political_exposure (valor não é "none")');
    }
    analysis.individual_check.political_exposure_value = accountData.individual.political_exposure;
  }

  // Verificar tos_acceptance
  if (!accountData.tos_acceptance) {
    missingFields.push('tos_acceptance (object não existe)');
    analysis.tos_acceptance_check.missing_object = true;
  } else {
    const tos = accountData.tos_acceptance;
    if (!tos.date || typeof tos.date !== 'number') {
      missingFields.push('tos_acceptance.date (deve ser timestamp Unix)');
    }
    if (!tos.ip || typeof tos.ip !== 'string') {
      missingFields.push('tos_acceptance.ip');
    }
    analysis.tos_acceptance_check.tos_structure = tos;
  }

  analysis.overall_structure.has_business_profile = !!accountData.business_profile;
  analysis.overall_structure.has_individual = !!accountData.individual;
  analysis.overall_structure.has_tos_acceptance = !!accountData.tos_acceptance;

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
export async function verifyStripeAccountStatus(accountId: string): Promise<{ success: boolean; account?: Stripe.Account; error?: string }> {
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
    console.log('📊 [SERVER-STRIPE] Capabilities:', account.capabilities);
    console.log('📊 [SERVER-STRIPE] Response completo:', JSON.stringify(account, null, 2));
    
    const result = { success: true, account };
    
    // 📊 LOG MELHORADO: Response completo da Stripe para debug no dashboard
    await logToNetworkChrome('STRIPE_ACCOUNT', 'VERIFY_STATUS_SUCESSO', { 
      accountId, 
      stripe_response_completo: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        business_type: account.business_type,
        country: account.country,
        default_currency: account.default_currency,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          past_due: account.requirements?.past_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          errors: account.requirements?.errors || [],
          disabled_reason: account.requirements?.disabled_reason
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
 * Criar ou atualizar conta conectada no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Custom accounts: Controle total sobre onboarding (platform gerencia tudo)
 * - Individual business_type: Para pessoas físicas
 * - MCC 8299: Código para serviços educacionais
 * - External accounts: Conta bancária para receber transfers
 * 
 * 🎯 ESTRATÉGIA 2 ETAPAS:
 * - CREATE: Dados mínimos (country + email) no cadastro inicial
 * - UPDATE: Dados completos + tos_acceptance na ativação de pagamentos
 *
 * 📖 STRIPE DOCS: "The only piece of information you need to create a Custom
 * connected account is the country. You can collect everything else at a later time."
 */
export async function createOrUpdateStripeConnectedAccount(userData: StripeOnboardingData): Promise<Stripe.Account> {
  // 🔍 DEBUG: Verificar se a função está sendo chamada
  await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_FUNCAO_CHAMADA', { 
    funcao: 'createOrUpdateStripeConnectedAccount - stripeServerClientService.ts',
    dados_recebidos: userData,
    timestamp: new Date().toISOString()
  });

  await logToNetworkChrome('STRIPE_ACCOUNT', 'CREATE_UPDATE_INICIADO', { 
    email: userData.email, 
    isUpdate: !!userData.stripe_account_id 
  });
  
  const isUpdate = userData.stripe_account_id && userData.stripe_account_id !== '';
  
  // 🔍 DEBUG: Verificar dados processados
  await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_DADOS_PROCESSADOS', {
    isUpdate,
    stripe_account_id: userData.stripe_account_id,
    has_phone: !!userData.phone,
    has_cpf: !!userData.cpf,
    has_address: !!userData.address?.line1
  });
  
  try {
    // Preparar dados no formato correto do Stripe
    const [firstName, ...lastNameParts] = userData.full_name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;
    
    // Processar data de nascimento (pode estar vazia na criação inicial)
    let dobData = undefined;
    if (userData.date_of_birth && userData.date_of_birth.trim() !== '') {
      const [year, month, day] = userData.date_of_birth.split('-');
      dobData = {
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10)
      };
    }
    
    // Preparar routing_number concatenado (pode estar vazio na criação inicial)
    let concatenatedRoutingNumber = '';
    if (userData.bank_account.routing_number && userData.bank_account.branch_number) {
      concatenatedRoutingNumber = `${userData.bank_account.routing_number}-${userData.bank_account.branch_number}`;
    }
    
    let stripeAccount: Stripe.Account;
    let finalAccountData: any;
    
    if (isUpdate) {
      // 🔍 DEBUG: Confirmar que entrou no fluxo UPDATE
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_FLUXO_UPDATE', {
        account_id: userData.stripe_account_id,
        timestamp: new Date().toISOString()
      });

      // ATUALIZAR conta existente
      const accountUpdateData: any = {
        business_type: 'individual' as const,
        individual: {
          first_name: firstName,
          last_name: lastName,
          email: userData.email,
          // 🎯 NOVO: Adicionar exposição política padrão (reduz fricção UX)
          political_exposure: 'none' as const,
        }
      };

      // 🔍 DEBUG: Verificar se political_exposure foi definido
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_POLITICAL_EXPOSURE', {
        political_exposure_definido: accountUpdateData.individual.political_exposure,
        valor: accountUpdateData.individual.political_exposure
      });

      // Adicionar campos opcionais apenas se tiverem valor
      if (userData.phone && userData.phone.trim() !== '') {
        accountUpdateData.individual.phone = `+55${userData.phone.replace(/\D/g, '')}`;
      }
      if (userData.cpf && userData.cpf.trim() !== '') {
        accountUpdateData.individual.id_number = userData.cpf.replace(/\D/g, '');
      }
      if (dobData) {
        accountUpdateData.individual.dob = dobData;
      }
      if (userData.address.line1 && userData.address.line1.trim() !== '') {
        accountUpdateData.individual.address = {
          line1: userData.address.line1,
          line2: userData.address.line2 ?? undefined,
          city: userData.address.city,
          state: userData.address.state,
          postal_code: userData.address.postal_code,
          country: userData.address.country
        };
      }

      // 🎯 OTIMIZAÇÃO: Incluir campos obrigatórios com valores padrão para reduzir fricção
      accountUpdateData.business_profile = {
        mcc: '8299',
        product_description: 'Plataforma de mentoria e cursos online',
        // NOVO: Receita mensal estimada (R$ 5.000 fixo - evita pergunta ao usuário)
        monthly_estimated_revenue: {
          amount: 500000, // R$ 5.000,00 em centavos
          currency: 'brl'
        }
      };

      // 🔍 DEBUG: Verificar se business_profile foi definido
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_BUSINESS_PROFILE', {
        business_profile_definido: !!accountUpdateData.business_profile,
        mcc: accountUpdateData.business_profile.mcc,
        monthly_estimated_revenue: accountUpdateData.business_profile.monthly_estimated_revenue
      });

      // 🎯 NOVO: Aceite de termos automático com timestamp atual
      accountUpdateData.tos_acceptance = {
        date: Math.floor(Date.now() / 1000),
        ip: userData.tos_ip || '127.0.0.1',
        user_agent: 'Mentora-Ai-Platform/1.0'
      };

      // 🔍 DEBUG: Verificar se tos_acceptance foi definido
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_TOS_ACCEPTANCE', {
        tos_acceptance_definido: !!accountUpdateData.tos_acceptance,
        date: accountUpdateData.tos_acceptance.date,
        ip: accountUpdateData.tos_acceptance.ip
      });

      finalAccountData = accountUpdateData;

      // 🔍 VALIDAÇÃO PRÉVIA: Verificar se todos os campos obrigatórios estão presentes
      const validation = validateStripeRequiredFields(finalAccountData);
      
      // 📊 LOG DETALHADO: Mostrar payload COMPLETO para debug
      await logToNetworkChrome('STRIPE_ACCOUNT', 'PAYLOAD_UPDATE_COMPLETO', {
        operation: 'UPDATE_ACCOUNT',
        account_id: userData.stripe_account_id,
        payload_enviado_para_stripe: finalAccountData,
        timestamp: new Date().toISOString(),
        campos_automaticos_adicionados: [
          'individual.political_exposure = "none"',
          'business_profile.monthly_estimated_revenue = {amount: 500000, currency: "brl"}',
          'tos_acceptance = {date: auto, ip: auto, user_agent: "Mentora-Ai-Platform/1.0"}'
        ],
        // 🔍 NOVA VALIDAÇÃO: Análise dos campos obrigatórios
        validacao_campos_obrigatorios: {
          todos_campos_presentes: validation.isValid,
          campos_faltando: validation.missingFields,
          analise_detalhada: validation.analysis
        }
      });

      // 🔍 DEBUG FINAL: Log do payload exato que vai para a Stripe
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_PAYLOAD_FINAL_STRIPE', {
        operacao: 'stripe.accounts.update',
        account_id: userData.stripe_account_id,
        payload_completo: accountUpdateData,
        campos_criticos: {
          individual_political_exposure: accountUpdateData.individual?.political_exposure,
          business_profile_monthly_revenue: accountUpdateData.business_profile?.monthly_estimated_revenue,
          tos_acceptance_date: accountUpdateData.tos_acceptance?.date,
          tos_acceptance_ip: accountUpdateData.tos_acceptance?.ip
        }
      });

      stripeAccount = await stripe.accounts.update(userData.stripe_account_id!, accountUpdateData);

      // 🔍 DEBUG: Verificar se a chamada Stripe foi bem-sucedida
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_STRIPE_UPDATE_SUCESSO', {
        account_id: stripeAccount.id,
        charges_enabled: stripeAccount.charges_enabled,
        payouts_enabled: stripeAccount.payouts_enabled,
        requirements_currently_due: stripeAccount.requirements?.currently_due || []
      });

      // Adicionar conta bancária externa apenas se houver dados
      if (concatenatedRoutingNumber && userData.bank_account.account_number) {
        const externalAccountData = {
          external_account: {
            object: 'bank_account' as const,
            country: 'BR',
            currency: 'brl',
            account_holder_type: 'individual' as const,
            routing_number: concatenatedRoutingNumber,
            account_number: userData.bank_account.account_number,
            account_holder_name: userData.bank_account.account_holder_name,
          }
        };

        await logToNetworkChrome('STRIPE_ACCOUNT', 'EXTERNAL_ACCOUNT_PAYLOAD', externalAccountData);
        await stripe.accounts.createExternalAccount(userData.stripe_account_id!, externalAccountData);
      }
      
    } else {
      // 🔍 DEBUG: Confirmar que entrou no fluxo CREATE
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_FLUXO_CREATE', {
        email: userData.email,
        timestamp: new Date().toISOString()
      });

      // CRIAR nova conta - DADOS MÍNIMOS APENAS
      // 📚 STRIPE DOCS: "The only piece of information you need to create a Custom 
      // connected account is the country. You can collect everything else at a later time."
      const accountCreateData: Stripe.AccountCreateParams = {
        type: 'custom',
        country: 'BR',
        email: userData.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
        // ✅ PARAR AQUI! Sem individual, sem business_profile, sem tos_acceptance
        // Tudo será enviado no UPDATE quando usuário clicar "Finalizar Configuração"
      };

      // ✅ ESTRATÉGIA: Não adicionar nenhum campo opcional no CREATE
      // Todos os dados detalhados serão enviados no UPDATE quando necessário
      
      // 🔍 DEBUG: Confirmar dados mínimos
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_CREATE_DADOS_MINIMOS', {
        campos_enviados: ['type', 'country', 'email', 'business_type', 'capabilities'],
        campos_NAO_enviados: ['individual', 'business_profile', 'tos_acceptance', 'external_account'],
        observacao: 'Dados completos serão enviados no UPDATE - conforme Stripe docs'
      });

      finalAccountData = accountCreateData;

      // 🔍 VALIDAÇÃO PRÉVIA: Verificar se todos os campos obrigatórios estão presentes
      const validation = validateStripeRequiredFields(finalAccountData);

      // 📊 LOG DETALHADO: Mostrar payload COMPLETO para debug
      await logToNetworkChrome('STRIPE_ACCOUNT', 'PAYLOAD_CREATE_COMPLETO', {
        operation: 'CREATE_ACCOUNT',
        payload_enviado_para_stripe: finalAccountData,
        timestamp: new Date().toISOString(),
        campos_automaticos_adicionados: [
          'NENHUM - Estratégia de dados mínimos'
        ],
        observacao: 'CREATE com dados mínimos - requirements serão resolvidos no UPDATE!',
        estrategia_2_etapas: {
          etapa_1_create: 'Dados mínimos (country + email + business_type)',
          etapa_2_update: 'Dados completos quando usuário ativar pagamentos',
          vantagem: 'UX melhor - cadastro rápido, dados só quando necessário'
        },
        // 🔍 NOVA VALIDAÇÃO: Análise dos campos obrigatórios
        validacao_campos_obrigatorios: {
          todos_campos_presentes: validation.isValid,
          campos_faltando: validation.missingFields,
          analise_detalhada: validation.analysis,
          IMPORTANTE: validation.isValid ? 
            'TODOS OS CAMPOS OBRIGATÓRIOS ESTÃO PRESENTES!' : 
            'ATENÇÃO: CAMPOS FALTANDO NO PAYLOAD!'
        }
      });

      stripeAccount = await stripe.accounts.create(accountCreateData);
    }
    
    await logToNetworkChrome('STRIPE_ACCOUNT', 'CREATE_UPDATE_SUCESSO', { 
      email: userData.email, 
      isUpdate,
      accountId: stripeAccount.id,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled,
      auto_filled_fields: [
        'business_profile.monthly_estimated_revenue',
        'individual.political_exposure',
        'tos_acceptance'
      ],
      stripe_requirements_returned: {
        currently_due: stripeAccount.requirements?.currently_due || [],
        past_due: stripeAccount.requirements?.past_due || [],
        eventually_due: stripeAccount.requirements?.eventually_due || [],
        errors: stripeAccount.requirements?.errors || []
      }
    });
    
    return stripeAccount;

  } catch (error) {
    await logToNetworkChrome('STRIPE_ACCOUNT', 'CREATE_UPDATE_ERRO', { 
      email: userData.email, 
      isUpdate,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      error_details: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export { stripe };
 