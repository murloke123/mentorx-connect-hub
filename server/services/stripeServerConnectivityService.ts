// ##########################################################################################
// ############### STRIPE CONNECTIVITY SERVICE - BACKEND ##################################
// ##########################################################################################

/**
 * 🎯 OBJETIVO: Serviço backend para testes de conectividade com Stripe API
 * 
 * ❓ POR QUE EXISTE: 
 * - Separar responsabilidades: contas vs conectividade
 * - Centralizar todos os testes de saúde da integração Stripe
 * - Facilitar debug sem impactar operações críticas de conta
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Este serviço roda no BACKEND (servidor)
 * - Faz chamadas diretas para a Stripe API usando nossas chaves secretas
 * - Nunca expõe chaves sensíveis para o frontend
 * - Só cuida de TESTAR se tudo está funcionando
 */

import Stripe from 'stripe';
import { config } from '../environment';

// ##########################################################################################
// ###################### CONFIGURAÇÃO DA STRIPE API #####################################
// ##########################################################################################

/**
 * 🔑 INICIALIZAÇÃO SEGURA DA STRIPE
 * 
 * 📚 PARA DEVS JUNIOR:
 * - Stripe é inicializada apenas no backend
 * - Usa a SECRET_KEY (nunca compartilhada com frontend)
 * - Configuração de API version para garantir compatibilidade
 */
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// ##########################################################################################
// ###################### INTERFACES DE CONECTIVIDADE ####################################
// ##########################################################################################

export interface ConnectivityTestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export interface HealthCheckResult {
  success: boolean;
  message: string;
  details: {
    apiKey: boolean;
    webhooks: boolean;
    products: boolean;
    connectivity: boolean;
  };
  timestamp: string;
}

export interface CredentialsValidationResult {
  success: boolean;
  message: string;
  details?: {
    secretKeyValid: boolean;
    environment: 'test' | 'live';
    accountId?: string;
  };
  timestamp: string;
}

// ##########################################################################################
// ###################### OPERAÇÕES DE CONECTIVIDADE #####################################
// ##########################################################################################

/**
 * 🧪 TESTE BÁSICO DE CONECTIVIDADE
 * 
 * 🎯 OBJETIVO: Verificar se conseguimos nos conectar à Stripe API
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Faz uma operação simples: listar 1 produto
 * 2. Se funcionar = conectividade OK
 * 3. Se falhar = problema na configuração ou rede
 * 
 * 🔄 O QUE TESTA:
 * - Chave da API válida
 * - Conectividade de rede
 * - Status dos serviços Stripe
 */
export async function testBasicConnectivity(): Promise<ConnectivityTestResult> {
  try {
    console.log('🔄 [CONNECTIVITY] Testando conectividade básica com Stripe...');
    
    // 📡 Operação simples: listar produtos (máximo 1)
    const products = await stripe.products.list({ limit: 1 });
    
    console.log('✅ [CONNECTIVITY] Conectividade OK - Produtos listados:', products.data.length);
    
    return {
      success: true,
      message: 'Conectividade com Stripe funcionando perfeitamente!',
      data: {
        productsCount: products.data.length,
        apiVersion: '2023-10-16',
        environment: config.stripe.secretKey.startsWith('sk_test_') ? 'test' : 'live'
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [CONNECTIVITY] Erro na conectividade:', error);
    
    return {
      success: false,
      message: `Erro de conectividade: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      data: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        environment: config.stripe.secretKey.startsWith('sk_test_') ? 'test' : 'live'
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 🏥 HEALTH CHECK COMPLETO
 * 
 * 🎯 OBJETIVO: Verificar múltiplos aspectos da integração Stripe
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Testa API key
 * 2. Verifica se consegue listar produtos
 * 3. Checa webhooks (se configurados)
 * 4. Valida operações básicas
 * 
 * 🔄 O QUE TESTA:
 * - ✅ API Key válida
 * - ✅ Listagem de produtos
 * - ✅ Webhooks configurados
 * - ✅ Conectividade geral
 */
export async function performFullHealthCheck(): Promise<HealthCheckResult> {
  console.log('🏥 [HEALTH-CHECK] Iniciando health check completo...');
  
  const results = {
    apiKey: false,
    webhooks: false,
    products: false,
    connectivity: false
  };
  
  try {
    // 🔑 Teste 1: Validar API Key
    console.log('🔑 [HEALTH-CHECK] Testando API Key...');
    try {
      const account = await stripe.accounts.retrieve();
      results.apiKey = true;
      console.log('✅ [HEALTH-CHECK] API Key válida para conta:', account.id);
    } catch (error) {
      console.error('❌ [HEALTH-CHECK] API Key inválida:', error);
    }
    
    // 📦 Teste 2: Listar produtos
    console.log('📦 [HEALTH-CHECK] Testando listagem de produtos...');
    try {
      const products = await stripe.products.list({ limit: 5 });
      results.products = true;
      console.log('✅ [HEALTH-CHECK] Produtos listados:', products.data.length);
    } catch (error) {
      console.error('❌ [HEALTH-CHECK] Erro ao listar produtos:', error);
    }
    
    // 🔗 Teste 3: Verificar webhooks
    console.log('🔗 [HEALTH-CHECK] Verificando webhooks...');
    try {
      const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 5 });
      results.webhooks = webhookEndpoints.data.length > 0;
      console.log('✅ [HEALTH-CHECK] Webhooks encontrados:', webhookEndpoints.data.length);
    } catch (error) {
      console.error('❌ [HEALTH-CHECK] Erro ao verificar webhooks:', error);
    }
    
    // 🌐 Teste 4: Conectividade geral
    console.log('🌐 [HEALTH-CHECK] Testando conectividade geral...');
    const connectivityTest = await testBasicConnectivity();
    results.connectivity = connectivityTest.success;
    
    // 📊 Resultado final
    const allHealthy = Object.values(results).every(result => result);
    const healthyCount = Object.values(results).filter(result => result).length;
    
    console.log(`📊 [HEALTH-CHECK] Resultado: ${healthyCount}/4 testes passaram`);
    
    return {
      success: allHealthy,
      message: allHealthy 
        ? 'Todos os testes de saúde passaram! Stripe totalmente funcional.'
        : `${healthyCount}/4 testes passaram. Verifique os logs para detalhes.`,
      details: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [HEALTH-CHECK] Erro crítico no health check:', error);
    
    return {
      success: false,
      message: `Erro crítico no health check: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: results,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 🔑 VALIDAÇÃO ESPECÍFICA DE CREDENCIAIS
 * 
 * 🎯 OBJETIVO: Verificar detalhadamente se as chaves da API estão corretas
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Valida se a Secret Key está correta
 * 2. Identifica se é ambiente test ou live
 * 3. Retorna informações da conta
 * 
 * 🔄 O QUE TESTA:
 * - ✅ Secret Key válida
 * - ✅ Ambiente correto (test/live)
 * - ✅ ID da conta Stripe
 */
export async function validateCredentials(): Promise<CredentialsValidationResult> {
  try {
    console.log('🔑 [CREDENTIALS] Validando credenciais Stripe...');
    
    // 🔍 Verificar se a chave é válida fazendo uma operação simples
    const account = await stripe.accounts.retrieve();
    
    // 🌍 Identificar ambiente
    const environment = config.stripe.secretKey.startsWith('sk_test_') ? 'test' : 'live';
    
    console.log('✅ [CREDENTIALS] Credenciais válidas para conta:', account.id);
    console.log('🌍 [CREDENTIALS] Ambiente:', environment);
    
    return {
      success: true,
      message: `Credenciais válidas! Conectado à conta ${account.id} no ambiente ${environment}.`,
      details: {
        secretKeyValid: true,
        environment: environment,
        accountId: account.id
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [CREDENTIALS] Credenciais inválidas:', error);
    
    return {
      success: false,
      message: `Credenciais inválidas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: {
        secretKeyValid: false,
        environment: config.stripe.secretKey.startsWith('sk_test_') ? 'test' : 'live'
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 📊 OPERAÇÕES BÁSICAS DE TESTE
 * 
 * 🎯 OBJETIVO: Testar operações comuns da Stripe para garantir funcionamento
 * 
 * 📚 PARA DEVS JUNIOR:
 * 1. Cria um produto de teste
 * 2. Lista produtos existentes
 * 3. Deleta o produto de teste
 * 4. Verifica se tudo funcionou
 * 
 * 🔄 O QUE TESTA:
 * - ✅ Criação de produtos
 * - ✅ Listagem de produtos
 * - ✅ Deleção de produtos
 * - ✅ Operações CRUD básicas
 */
export async function testBasicOperations(): Promise<ConnectivityTestResult> {
  try {
    console.log('🧪 [OPERATIONS] Testando operações básicas...');
    
    // 1️⃣ Criar produto de teste
    console.log('🧪 [OPERATIONS] Criando produto de teste...');
    const testProduct = await stripe.products.create({
      name: 'Test Product - Connectivity Check',
      description: 'Produto criado automaticamente para testar conectividade',
      type: 'service'
    });
    
    console.log('✅ [OPERATIONS] Produto criado:', testProduct.id);
    
    // 2️⃣ Listar produtos (incluindo o recém-criado)
    console.log('🧪 [OPERATIONS] Listando produtos...');
    const products = await stripe.products.list({ limit: 10 });
    
    console.log('✅ [OPERATIONS] Produtos listados:', products.data.length);
    
    // 3️⃣ Deletar produto de teste
    console.log('🧪 [OPERATIONS] Deletando produto de teste...');
    await stripe.products.del(testProduct.id);
    
    console.log('✅ [OPERATIONS] Produto deletado:', testProduct.id);
    
    return {
      success: true,
      message: 'Todas as operações básicas funcionaram perfeitamente!',
      data: {
        productCreated: testProduct.id,
        totalProducts: products.data.length,
        operationsTested: ['create', 'list', 'delete']
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ [OPERATIONS] Erro nas operações básicas:', error);
    
    return {
      success: false,
      message: `Erro nas operações básicas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      data: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      timestamp: new Date().toISOString()
    };
  }
} 