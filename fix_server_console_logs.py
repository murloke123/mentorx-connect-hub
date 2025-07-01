import re

# Ler o arquivo atual
with open('server/services/stripeServerClientService.ts', 'r') as f:
    content = f.read()

# Encontrar o método verifyStripeAccountStatus e adicionar logs de console
old_method_start = """export async function verifyStripeAccountStatus(accountId: string): Promise<{ success: boolean; account?: Stripe.Account; error?: string }> {
  await logToNetworkChrome('STRIPE_ACCOUNT', 'VERIFY_STATUS_INICIADO', { accountId });
  
  try {
    const account = await stripe.accounts.retrieve(accountId);"""

new_method_start = """export async function verifyStripeAccountStatus(accountId: string): Promise<{ success: boolean; account?: Stripe.Account; error?: string }> {
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
    console.log('�� [SERVER-STRIPE] Payouts enabled:', account.payouts_enabled);
    console.log('📊 [SERVER-STRIPE] Details submitted:', account.details_submitted);
    console.log('📊 [SERVER-STRIPE] Requirements currently due:', account.requirements?.currently_due || []);
    console.log('📊 [SERVER-STRIPE] Requirements past due:', account.requirements?.past_due || []);
    console.log('📊 [SERVER-STRIPE] Capabilities:', account.capabilities);
    console.log('📊 [SERVER-STRIPE] Response completo:', JSON.stringify(account, null, 2));"""

content = content.replace(old_method_start, new_method_start)

# Salvar o arquivo modificado
with open('server/services/stripeServerClientService.ts', 'w') as f:
    f.write(content)

print("✅ Logs de console adicionados ao verifyStripeAccountStatus!")
