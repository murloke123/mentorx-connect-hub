// Teste simples para debug do problema de fetch
export async function testSimpleStripeAPI() {
  console.log('🧪 testSimpleStripeAPI: Iniciando teste simples...');
  
  try {
    const url = '/api/stripe/verify-balance';
    console.log('🔗 testSimpleStripeAPI: URL:', url);
    
    const payload = {
      stripeAccountId: 'acct_1RccedRGx7Up4HIL'
    };
    console.log('📦 testSimpleStripeAPI: Payload:', payload);
    
    console.log('🚀 testSimpleStripeAPI: Fazendo fetch...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('✅ testSimpleStripeAPI: Response recebida');
    console.log('📊 testSimpleStripeAPI: Status:', response.status);
    console.log('📋 testSimpleStripeAPI: Headers:', response.headers);
    console.log('🔧 testSimpleStripeAPI: OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ testSimpleStripeAPI: Response não OK:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
    
    const data = await response.json();
    console.log('🎉 testSimpleStripeAPI: Dados recebidos:', data);
    
    return { success: true, data };
    
  } catch (error) {
    console.error('💥 testSimpleStripeAPI: Erro capturado:', error);
    console.error('💥 testSimpleStripeAPI: Tipo:', typeof error);
    console.error('💥 testSimpleStripeAPI: Nome:', error instanceof Error ? error.name : 'Unknown');
    console.error('💥 testSimpleStripeAPI: Message:', error instanceof Error ? error.message : 'Unknown');
    console.error('💥 testSimpleStripeAPI: Stack:', error instanceof Error ? error.stack : 'Unknown');
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown'
    };
  }
}

// Função para testar no console do navegador
(window as any).testStripeAPI = testSimpleStripeAPI;