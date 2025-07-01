// ##########################################################################################
// ################# STRIPE CONNECTIVITY SERVICE - FRONTEND ##############################
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço frontend para testes de conectividade com Stripe
 * 
 * ❓ POR QUE EXISTE: 
 * - Separar responsabilidades: contas vs conectividade
 * - Facilitar debug e troubleshooting de problemas de integração
 * - Permitir health checks da API Stripe sem impactar operações de conta
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Este serviço só cuida de TESTAR se a Stripe está funcionando
 * - Não mexe com contas, apenas verifica se conseguimos nos conectar
 * - Frontend (aqui) → Backend (nosso servidor) → Stripe API (teste)
 */

// ##########################################################################################
// ###################### SISTEMA DE LOGS PARA DEBUG #####################################
// ##########################################################################################

/**
 * 📊 SISTEMA DE LOGS PARA NETWORK (Chrome DevTools)
 * 
 * 🎯 OBJETIVO: Registrar todas as operações de conectividade no Network do navegador
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Cada teste gera um log visível no Network do Chrome
 * - Facilita debug: você vê exatamente se a conectividade funcionou
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
// ###################### INTERFACES DE CONECTIVIDADE ####################################
// ##########################################################################################

export interface StripeConnectivityResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface StripeHealthCheckResult {
  success: boolean;
  message: string;
  details?: {
    apiKey: boolean;
    webhooks: boolean;
    products: boolean;
    connectivity: boolean;
  };
}

// ##########################################################################################
// ###################### OPERAÇÕES DE CONECTIVIDADE #####################################
// ##########################################################################################

/**
 * 🧪 TESTAR CONECTIVIDADE BÁSICA COM STRIPE
 * 
 * 🎯 OBJETIVO: Verificar se nosso backend consegue se comunicar com a Stripe API
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Chama GET /api/stripe/connectivity/test (endpoint de teste)
 * 2. O backend faz uma operação simples na Stripe (como listar produtos)
 * 3. Se funcionar = conectividade OK
 * 4. Se falhar = problema na configuração ou chave da API
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/connectivity/test → Backend → Stripe API → Resultado do teste
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_CONNECTIVITY + TEST_SOLICITADO (teste iniciado)
 * - STRIPE_CONNECTIVITY + TEST_RESPONSE (resultado do teste)
 * - STRIPE_CONNECTIVITY + TEST_ERRO (se der erro)
 */
export async function testStripeConnectivity(): Promise<StripeConnectivityResult> {
  try {
    // 📊 Log: Registra no Network que estamos testando a conectividade
    await logToNetworkChrome('STRIPE_CONNECTIVITY', 'TEST_SOLICITADO', {});

    // 🌐 Chamada HTTP para testar a conectividade no backend
    const response = await fetch('/api/stripe/connectivity/test');
    const result = await response.json();

    // 📊 Log: Registra no Network o resultado do teste
    await logToNetworkChrome('STRIPE_CONNECTIVITY', 'TEST_RESPONSE', {
      status: response.status,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        message: `Erro HTTP ${response.status}: ${result.error || 'Erro desconhecido'}`
      };
    }

    // ✅ Sucesso: conectividade OK
    return {
      success: true,
      message: result.message,
      data: result
    };

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_CONNECTIVITY', 'TEST_ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * 🏥 HEALTH CHECK COMPLETO DA STRIPE
 * 
 * 🎯 OBJETIVO: Verificar múltiplos aspectos da integração Stripe
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Testa se a API key está válida
 * 2. Verifica se consegue listar produtos
 * 3. Checa se webhooks estão configurados
 * 4. Valida se operações básicas funcionam
 * 
 * 🔄 FLUXO:
 * Frontend → GET /api/stripe/connectivity/health → Backend → Multiple Stripe API calls → Status completo
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_HEALTH + CHECK_INICIADO (health check iniciado)
 * - STRIPE_HEALTH + CHECK_RESULTADO (resultado completo)
 * - STRIPE_HEALTH + CHECK_ERRO (se der erro)
 */
export async function performStripeHealthCheck(): Promise<StripeHealthCheckResult> {
  try {
    // 📊 Log: Registra no Network que estamos fazendo health check
    await logToNetworkChrome('STRIPE_HEALTH', 'CHECK_INICIADO', {});

    // 🌐 Chamada HTTP para fazer health check completo
    const response = await fetch('/api/stripe/connectivity/health');
    const result = await response.json();

    // 📊 Log: Registra no Network o resultado do health check
    await logToNetworkChrome('STRIPE_HEALTH', 'CHECK_RESULTADO', {
      status: response.status,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        message: `Erro no health check: ${result.error || 'Erro desconhecido'}`
      };
    }

    // ✅ Sucesso: health check completo
    return {
      success: true,
      message: result.message,
      details: result.details
    };

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_HEALTH', 'CHECK_ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      message: `Erro de conexão no health check: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}

/**
 * 🔑 VALIDAR CREDENCIAIS STRIPE
 * 
 * 🎯 OBJETIVO: Verificar especificamente se as chaves da API estão corretas
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Testa se a Secret Key está válida
 * 2. Verifica se a Publishable Key está correta
 * 3. Confirma se as chaves são do ambiente correto (test/live)
 * 
 * 🔄 FLUXO:
 * Frontend → POST /api/stripe/connectivity/validate → Backend → Stripe API validation → Status das chaves
 * 
 * 📊 LOGS GERADOS:
 * - STRIPE_CREDENTIALS + VALIDATION_INICIADA (validação iniciada)
 * - STRIPE_CREDENTIALS + VALIDATION_RESULTADO (resultado da validação)
 * - STRIPE_CREDENTIALS + VALIDATION_ERRO (se der erro)
 */
export async function validateStripeCredentials(): Promise<StripeConnectivityResult> {
  try {
    // 📊 Log: Registra no Network que estamos validando credenciais
    await logToNetworkChrome('STRIPE_CREDENTIALS', 'VALIDATION_INICIADA', {});

    // 🌐 Chamada HTTP para validar credenciais no backend
    const response = await fetch('/api/stripe/connectivity/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();

    // 📊 Log: Registra no Network o resultado da validação
    await logToNetworkChrome('STRIPE_CREDENTIALS', 'VALIDATION_RESULTADO', {
      status: response.status,
      result: result
    });

    // ❌ Se o backend retornou erro HTTP
    if (!response.ok) {
      return {
        success: false,
        message: `Credenciais inválidas: ${result.error || 'Erro desconhecido'}`
      };
    }

    // ✅ Sucesso: credenciais válidas
    return {
      success: true,
      message: result.message,
      data: result
    };

  } catch (error) {
    // 📊 Log: Registra erros de conexão/rede
    await logToNetworkChrome('STRIPE_CREDENTIALS', 'VALIDATION_ERRO', {
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    
    return {
      success: false,
      message: `Erro ao validar credenciais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
} 