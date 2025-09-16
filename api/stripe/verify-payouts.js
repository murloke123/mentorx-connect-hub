// Vercel Serverless Function - Stripe Verify Payouts
import Stripe from 'stripe';

// Inicializar Stripe sem versão específica da API para máxima compatibilidade
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Handler serverless para verificar payouts de conta conectada do Stripe
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
    
    console.log('🚀 SERVERLESS verify-payouts: Requisição recebida');
    console.log('📦 SERVERLESS verify-payouts: Stripe Account ID:', stripeAccountId);
    console.log('🌐 SERVERLESS verify-payouts: Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      timestamp: new Date().toISOString()
    });
    
    // Validações
    if (!stripeAccountId) {
      console.error('❌ SERVERLESS verify-payouts: stripeAccountId não fornecido');
      return res.status(400).json({
        success: false,
        error: 'stripeAccountId é obrigatório para verificar payouts'
      });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ SERVERLESS verify-payouts: STRIPE_SECRET_KEY não configurada');
      return res.status(500).json({
        success: false,
        error: 'Configuração do Stripe não encontrada'
      });
    }
    
    console.log('📡 SERVERLESS verify-payouts: Fazendo chamada para Stripe API (balance_transactions)...');
    
    // Buscar balance_transactions do tipo payout da conta conectada
    const balanceTransactions = await stripe.balanceTransactions.list(
      {
        type: 'payout',
        limit: 10 // Limitar a 10 transações mais recentes
      },
      {
        stripeAccount: stripeAccountId
      }
    );
    
    const apiCallDuration = Date.now() - startTime;
    console.log(`✅ SERVERLESS verify-payouts: Chamada Stripe concluída em ${apiCallDuration}ms`);
    console.log('📊 SERVERLESS verify-payouts: Balance transactions encontradas:', balanceTransactions.data.length);
    
    // Calcular estatísticas dos payouts
    let totalAmount = 0;
    let totalPayouts = 0;
    let pendingPayouts = 0;
    let completedPayouts = 0;
    let currency = 'brl';
    
    balanceTransactions.data.forEach((transaction) => {
      if (transaction.type === 'payout') {
        // Payouts são valores negativos, então usamos Math.abs()
        const payoutAmount = Math.abs(transaction.amount) / 100; // Converter de centavos para reais
        totalAmount += payoutAmount;
        totalPayouts++;
        currency = transaction.currency;
        
        if (transaction.status === 'available') {
          completedPayouts++;
        } else {
          pendingPayouts++;
        }
      }
    });
    
    console.log('💵 SERVERLESS verify-payouts: Estatísticas calculadas:', {
      totalTransactions: balanceTransactions.data.length,
      totalAmount,
      totalPayouts,
      completedPayouts,
      pendingPayouts,
      currency
    });
    
    // Retornar dados no formato com estatísticas
    const result = {
      success: true,
      payouts: balanceTransactions.data.map(transaction => ({
        id: transaction.source,
        amount: Math.abs(transaction.amount) / 100,
        currency: transaction.currency,
        status: transaction.status === 'available' ? 'paid' : 'pending',
        arrival_date: transaction.available_on,
        created: transaction.created,
        description: transaction.description,
        method: 'standard',
        type: 'bank_account'
      })),
      statistics: {
        total: totalPayouts,
        totalAmount: totalAmount,
        pending: pendingPayouts,
        completed: completedPayouts,
        currency: currency
      },
      message: `${totalPayouts} payouts encontrados`,
      metadata: {
        stripe_account_id: stripeAccountId,
        api_call_duration_ms: apiCallDuration,
        total_duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ SERVERLESS verify-payouts: Resposta enviada com sucesso em ${duration}ms`);
    console.log('📊 SERVERLESS verify-payouts: Resultado:', {
      success: result.success,
      transactionsCount: balanceTransactions.data.length
    });
    
    return res.status(200).json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ SERVERLESS verify-payouts: Erro após ${duration}ms:`, error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('❌ SERVERLESS verify-payouts: Error name:', error.name);
      console.error('❌ SERVERLESS verify-payouts: Error message:', error.message);
      console.error('❌ SERVERLESS verify-payouts: Error stack:', error.stack);
    }
    
    // Log adicional para erros específicos do Stripe
    if (error.type) {
      console.error('🔍 SERVERLESS verify-payouts: Stripe Error Details:', {
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
    
    console.error('❌ SERVERLESS verify-payouts: Enviando resposta de erro:', errorResponse);
    return res.status(500).json(errorResponse);
  }
};