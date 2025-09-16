// Vercel Serverless Function - Stripe Verify Balance
import Stripe from 'stripe';

// Inicializar Stripe sem versão específica da API para máxima compatibilidade
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Handler serverless para verificar saldo de conta conectada do Stripe
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async (req, res) => {
  const startTime = Date.now();
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Apenas aceitar POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }
  
  try {
    const { stripeAccountId } = req.body;
    
    console.log('🚀 SERVERLESS verify-balance: Requisição recebida');
    console.log('📦 SERVERLESS verify-balance: Stripe Account ID:', stripeAccountId);
    console.log('🌐 SERVERLESS verify-balance: Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      timestamp: new Date().toISOString()
    });
    
    // Validações
    if (!stripeAccountId) {
      console.error('❌ SERVERLESS verify-balance: stripeAccountId não fornecido');
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório para verificar saldo'
      });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ SERVERLESS verify-balance: STRIPE_SECRET_KEY não configurada');
      return res.status(500).json({
        success: false,
        error: 'Configuração do Stripe não encontrada'
      });
    }
    
    console.log('📡 SERVERLESS verify-balance: Fazendo chamada para Stripe API...');
    
    // Buscar saldo da conta conectada
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeAccountId
    });
    
    const apiCallDuration = Date.now() - startTime;
    console.log(`✅ SERVERLESS verify-balance: Chamada Stripe concluída em ${apiCallDuration}ms`);
    console.log('📊 SERVERLESS verify-balance: Balance completo:', JSON.stringify(balance, null, 2));
    
    // Calcular total pendente
    let totalPending = 0;
    let currency = 'brl';
    
    console.log('🔍 SERVERLESS verify-balance: Analisando balance.pending:', {
      hasPending: !!balance.pending,
      pendingLength: balance.pending?.length || 0,
      pendingArray: balance.pending
    });
    
    if (balance.pending && balance.pending.length > 0) {
      // Somar todos os valores pendentes (normalmente há um por moeda)
      balance.pending.forEach((pendingBalance, index) => {
        console.log(`💰 SERVERLESS verify-balance: Pendente[${index}]:`, {
          currency: pendingBalance.currency,
          amount: pendingBalance.amount,
          source_types: pendingBalance.source_types
        });
        totalPending += pendingBalance.amount;
        currency = pendingBalance.currency;
      });
    } else {
      console.log('ℹ️ SERVERLESS verify-balance: Nenhum saldo pendente encontrado');
    }
    
    // Converter de centavos para valor real
    const pendingAmountInCurrency = totalPending / 100;
    console.log('💵 SERVERLESS verify-balance: Conversão:', {
      totalPendingCentavos: totalPending,
      pendingAmountInCurrency,
      currency
    });
    
    const result = {
      success: true,
      pendingAmount: pendingAmountInCurrency,
      currency: currency,
      rawBalance: balance,
      message: `Saldo pendente: ${pendingAmountInCurrency} ${currency.toUpperCase()}`
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ SERVERLESS verify-balance: Resposta enviada com sucesso em ${duration}ms`);
    console.log('📊 SERVERLESS verify-balance: Resultado:', result);
    
    return res.status(200).json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ SERVERLESS verify-balance: Erro após ${duration}ms:`, error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('❌ SERVERLESS verify-balance: Error name:', error.name);
      console.error('❌ SERVERLESS verify-balance: Error message:', error.message);
      console.error('❌ SERVERLESS verify-balance: Error stack:', error.stack);
    }
    
    // Log adicional para erros específicos do Stripe
    if (error.type) {
      console.error('🔍 SERVERLESS verify-balance: Stripe Error Details:', {
        type: error.type,
        decline_code: error.decline_code,
        charge: error.charge,
        payment_intent: error.payment_intent,
        setup_intent: error.setup_intent,
        source: error.source
      });
    }
    
    // Verificar se é um erro de timeout ou rede
    const isNetworkError = error instanceof Error && (
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('fetch')
    );
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      errorType: error instanceof Error ? error.name : 'UnknownError',
      isNetworkError,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      }
    };
    
    console.error('❌ SERVERLESS verify-balance: Enviando resposta de erro:', errorResponse);
    return res.status(500).json(errorResponse);
  }
};