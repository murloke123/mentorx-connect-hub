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
  try {
    console.log('🔍 stripeServerVerifyBalanceService: Verificando saldo para conta:', connectedAccountId);

    if (!connectedAccountId) {
      throw new Error('ID da conta conectada é obrigatório');
    }

    // Buscar saldo da conta conectada
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId
    });

    console.log('📊 stripeServerVerifyBalanceService: Balance completo:', JSON.stringify(balance, null, 2));

    // Calcular total pendente
    let totalPending = 0;
    let currency = 'brl';

    if (balance.pending && balance.pending.length > 0) {
      // Somar todos os valores pendentes (normalmente há um por moeda)
      balance.pending.forEach((pendingBalance: any) => {
        totalPending += pendingBalance.amount;
        currency = pendingBalance.currency;
        console.log(`💰 stripeServerVerifyBalanceService: Pendente ${pendingBalance.currency}: ${pendingBalance.amount}`);
      });
    }

    // Converter de centavos para valor real
    const pendingAmountInCurrency = totalPending / 100;

    const result: BalanceResult = {
      success: true,
      pendingAmount: pendingAmountInCurrency,
      currency: currency,
      rawBalance: balance,
      message: `Saldo pendente: ${pendingAmountInCurrency} ${currency.toUpperCase()}`
    };

    console.log('✅ stripeServerVerifyBalanceService: Resultado:', result);
    return result;

  } catch (error) {
    console.error('❌ stripeServerVerifyBalanceService: Erro ao verificar saldo:', error);
    
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
