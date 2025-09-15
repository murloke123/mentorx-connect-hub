import { toast } from '@/hooks/use-toast';

// Usa URL relativa já que frontend e backend estão na mesma porta
const API_BASE_URL = '';

export interface StripeBalanceData {
  pendingAmount: number;
  currency: string;
  success: boolean;
  message?: string;
}

export async function verifyStripeBalance(stripeAccountId: string): Promise<StripeBalanceData> {
  try {
    console.log('🔍 stripeVerifyBalanceService: Verificando saldo pendente para conta:', stripeAccountId);
    console.log('🌐 stripeVerifyBalanceService: Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE_URL,
      currentURL: window.location.href,
      isVercel: window.location.hostname.includes('vercel.app')
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Aumentado para 15 segundos

    const requestUrl = `${API_BASE_URL}/api/stripe/verify-balance`;
    console.log('📡 stripeVerifyBalanceService: Fazendo requisição para:', requestUrl);

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripeAccountId: stripeAccountId
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 stripeVerifyBalanceService: Response status:', response.status);
    console.log('📡 stripeVerifyBalanceService: Response statusText:', response.statusText);
    console.log('📡 stripeVerifyBalanceService: Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('📡 stripeVerifyBalanceService: Response URL:', response.url);

    // Capturar o texto bruto da resposta primeiro
    const responseText = await response.text();
    console.log('📄 stripeVerifyBalanceService: Response text (primeiros 500 chars):', responseText.substring(0, 500));
    console.log('📄 stripeVerifyBalanceService: Response text length:', responseText.length);

    if (!response.ok) {
      console.error('❌ stripeVerifyBalanceService: Response não OK. Status:', response.status);
      console.error('❌ stripeVerifyBalanceService: Response text completo:', responseText);
      
      // Tentar fazer parse do JSON se possível
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.error('❌ stripeVerifyBalanceService: Error data parsed:', errorData);
      } catch (parseError) {
        console.error('❌ stripeVerifyBalanceService: Não foi possível fazer parse do JSON de erro:', parseError);
        console.error('❌ stripeVerifyBalanceService: Raw response:', responseText);
        throw new Error(`Erro do servidor (${response.status}): ${responseText.substring(0, 200)}`);
      }
      
      throw new Error(errorData.message || errorData.error || 'Erro ao verificar saldo pendente');
    }

    // Tentar fazer parse do JSON de sucesso
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ stripeVerifyBalanceService: Data parsed successfully:', data);
    } catch (parseError) {
      console.error('❌ stripeVerifyBalanceService: Erro ao fazer parse do JSON de sucesso:', parseError);
      console.error('❌ stripeVerifyBalanceService: Response text que falhou no parse:', responseText);
      throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 200)}`);
    }

    console.log('✅ stripeVerifyBalanceService: Saldo verificado com sucesso');

    return {
      pendingAmount: data.pendingAmount || 0,
      currency: data.currency || 'brl',
      success: true,
      message: data.message
    };

  } catch (error) {
    console.error('❌ stripeVerifyBalanceService: Erro ao verificar saldo:', error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('❌ stripeVerifyBalanceService: Error name:', error.name);
      console.error('❌ stripeVerifyBalanceService: Error message:', error.message);
      console.error('❌ stripeVerifyBalanceService: Error stack:', error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch";
    
    toast({
      title: "Erro ao verificar saldo",
      description: `${errorMessage} (Verifique o console para mais detalhes)`,
      variant: "destructive",
    });

    return {
      pendingAmount: 0,
      currency: 'brl',
      success: false,
      message: errorMessage
    };
  }
}