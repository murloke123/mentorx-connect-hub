import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

interface BalanceResult {
  success: boolean;
  pendingAmount: number;
  currency: string;
  rawBalance?: any;
  message?: string;
  error?: string;
}

/**
 * Verifica o saldo pendente de uma conta conectada do Stripe
 * @param connectedAccountId - ID da conta conectada
 * @returns Objeto com saldo pendente e informações
 */
async function verifyConnectedAccountBalance(connectedAccountId: string): Promise<BalanceResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 stripeServerVerifyBalanceService: Verificando saldo para conta:', connectedAccountId);
    console.log('🌐 stripeServerVerifyBalanceService: Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      stripeApiVersion: stripe.getApiField('version'),
      timestamp: new Date().toISOString()
    });

    if (!connectedAccountId) {
      throw new Error('ID da conta conectada é obrigatório');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }

    console.log('📡 stripeServerVerifyBalanceService: Fazendo chamada para Stripe API...');
    console.log('📡 stripeServerVerifyBalanceService: Parâmetros:', {
      stripeAccount: connectedAccountId,
      method: 'balance.retrieve'
    });

    // Buscar saldo da conta conectada
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId
    });

    const apiCallDuration = Date.now() - startTime;
    console.log(`✅ stripeServerVerifyBalanceService: Chamada Stripe concluída em ${apiCallDuration}ms`);
    console.log('📊 stripeServerVerifyBalanceService: Balance completo:', JSON.stringify(balance, null, 2));

    // Calcular total pendente
    let totalPending = 0;
    let currency = 'brl';

    console.log('🔍 stripeServerVerifyBalanceService: Analisando balance.pending:', {
      hasPending: !!balance.pending,
      pendingLength: balance.pending?.length || 0,
      pendingArray: balance.pending
    });

    if (balance.pending && balance.pending.length > 0) {
      // Somar todos os valores pendentes (normalmente há um por moeda)
      balance.pending.forEach((pendingBalance: any, index: number) => {
        console.log(`💰 stripeServerVerifyBalanceService: Pendente[${index}]:`, {
          currency: pendingBalance.currency,
          amount: pendingBalance.amount,
          source_types: pendingBalance.source_types
        });
        totalPending += pendingBalance.amount;
        currency = pendingBalance.currency;
      });
    } else {
      console.log('ℹ️ stripeServerVerifyBalanceService: Nenhum saldo pendente encontrado');
    }

    // Converter de centavos para valor real
    const pendingAmountInCurrency = totalPending / 100;
    console.log('💵 stripeServerVerifyBalanceService: Conversão:', {
      totalPendingCentavos: totalPending,
      pendingAmountInCurrency,
      currency
    });

    const result: BalanceResult = {
      success: true,
      pendingAmount: pendingAmountInCurrency,
      currency: currency,
      rawBalance: balance,
      message: `Saldo pendente: ${pendingAmountInCurrency} ${currency.toUpperCase()}`
    };

    console.log('✅ stripeServerVerifyBalanceService: Resultado:', result);
    return result;

  } catch (error: any) {
    const totalDuration = Date.now() - startTime;
    console.error('❌ stripeServerVerifyBalanceService: Erro ao verificar saldo:', {
      errorMessage: error.message,
      errorType: error.constructor.name,
      errorCode: error.code,
      errorParam: error.param,
      errorStatusCode: error.statusCode,
      errorRequestId: error.requestId,
      errorStack: error.stack,
      totalDuration: `${totalDuration}ms`,
      timestamp: new Date().toISOString(),
      connectedAccountId,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY
      }
    });
    
    // Log adicional para erros específicos do Stripe
    if (error.type) {
      console.error('🔍 stripeServerVerifyBalanceService: Stripe Error Details:', {
        type: error.type,
        decline_code: error.decline_code,
        charge: error.charge,
        payment_intent: error.payment_intent,
        setup_intent: error.setup_intent,
        source: error.source
      });
    }
    
    // Log do erro original para debug
    console.error('🔍 stripeServerVerifyBalanceService: Original Error Object:', error);
    
    return {
      success: false,
      pendingAmount: 0,
      currency: 'brl',
      message: error instanceof Error ? error.message : 'Erro ao verificar saldo pendente',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export {
    verifyConnectedAccountBalance
};
