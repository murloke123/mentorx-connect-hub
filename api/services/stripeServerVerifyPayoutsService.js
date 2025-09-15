"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConnectedAccountPayouts = verifyConnectedAccountPayouts;
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
});
/**
 * Verifica os payouts já realizados de uma conta conectada do Stripe usando balance_transactions
 * @param connectedAccountId - ID da conta conectada
 * @returns Objeto com total pago e informações
 */
async function verifyConnectedAccountPayouts(connectedAccountId) {
    try {
        console.log('🔍 stripeServerVerifyPayoutsService: Verificando balance_transactions (payouts) para conta:', connectedAccountId);
        if (!connectedAccountId) {
            throw new Error('ID da conta conectada é obrigatório');
        }
        // ✅ CORRIGIDO: Usar balance_transactions com type=payout
        const balanceTransactions = await stripe.balanceTransactions.list({
            type: 'payout',
            limit: 100, // Limitando a 100 para performance
        }, {
            stripeAccount: connectedAccountId
        });
        console.log('📊 stripeServerVerifyPayoutsService: PAYLOAD COMPLETO DA STRIPE API:');
        console.log(JSON.stringify(balanceTransactions, null, 2));
        console.log(`📈 stripeServerVerifyPayoutsService: ${balanceTransactions.data.length} balance_transactions encontrados`);
        let totalPaidOut = 0;
        let currency = 'brl';
        let paidPayoutsCount = 0;
        // Processar balance_transactions do tipo payout
        balanceTransactions.data.forEach((transaction) => {
            console.log(`💸 stripeServerVerifyPayoutsService: Transaction ${transaction.id}:`);
            console.log(`   - Type: ${transaction.type}`);
            console.log(`   - Amount: ${transaction.amount} (${transaction.currency})`);
            console.log(`   - Net: ${transaction.net}`);
            console.log(`   - Status: ${transaction.status}`);
            console.log(`   - Description: ${transaction.description}`);
            console.log(`   - Created: ${new Date(transaction.created * 1000).toISOString()}`);
            if (transaction.type === 'payout' && transaction.status === 'available') {
                // Payouts são valores negativos, então usamos Math.abs()
                const payoutAmount = Math.abs(transaction.amount);
                totalPaidOut += payoutAmount;
                currency = transaction.currency;
                paidPayoutsCount++;
                console.log(`   ✅ PAYOUT VÁLIDO: ${payoutAmount} centavos`);
            }
            else {
                console.log(`   ⏭️ PAYOUT IGNORADO: type=${transaction.type}, status=${transaction.status}`);
            }
        });
        // Converter de centavos para valor real
        const totalPaidOutInCurrency = totalPaidOut / 100;
        console.log('=== RESULTADO FINAL ===');
        console.log('Total pago (centavos):', totalPaidOut);
        console.log('Total pago (R$):', totalPaidOutInCurrency.toFixed(2));
        console.log('Número de payouts válidos:', paidPayoutsCount);
        const result = {
            success: true,
            totalPaidOut: totalPaidOutInCurrency,
            currency: currency,
            payoutsCount: paidPayoutsCount,
            totalPayoutsFound: balanceTransactions.data.length,
            message: `Total pago: ${totalPaidOutInCurrency.toFixed(2)} ${currency.toUpperCase()} em ${paidPayoutsCount} pagamentos`,
            rawResponse: balanceTransactions
        };
        console.log('✅ stripeServerVerifyPayoutsService: Resultado final:', result);
        return result;
    }
    catch (error) {
        console.error('❌ stripeServerVerifyPayoutsService: Erro ao verificar balance_transactions:', error);
        return {
            success: false,
            totalPaidOut: 0,
            currency: 'brl',
            payoutsCount: 0,
            message: error instanceof Error ? error.message : 'Erro ao verificar payouts',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
    }
}
