import { toast } from '@/hooks/use-toast';

// Força o uso da porta correta
const API_BASE_URL = 'http://localhost:5000';

export interface StripeBalanceData {
  pendingAmount: number;
  currency: string;
  success: boolean;
  message?: string;
}

export async function verifyStripeBalance(stripeAccountId: string): Promise<StripeBalanceData> {
  try {
    console.log('🔍 stripeVerifyBalanceService: Verificando saldo pendente para conta:', stripeAccountId);
    console.log('🌐 stripeVerifyBalanceService: URL da API:', `${API_BASE_URL}/api/stripe/verify-balance`);
    console.log('🌐 stripeVerifyBalanceService: API_BASE_URL:', API_BASE_URL);
    console.log('🌐 stripeVerifyBalanceService: VITE_API_URL:', import.meta.env.VITE_API_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const response = await fetch(`${API_BASE_URL}/api/stripe/verify-balance`, {
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
    console.log('📡 stripeVerifyBalanceService: Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ stripeVerifyBalanceService: Erro na resposta:', errorData);
      throw new Error(errorData.message || 'Erro ao verificar saldo pendente');
    }

    const data = await response.json();
    console.log('✅ stripeVerifyBalanceService: Saldo verificado com sucesso');

    return {
      pendingAmount: data.pendingAmount || 0,
      currency: data.currency || 'brl',
      success: true,
      message: data.message
    };

  } catch (error) {
    console.error('❌ stripeVerifyBalanceService: Erro ao verificar saldo:', error);
    console.error('❌ stripeVerifyBalanceService: Tipo do erro:', typeof error);
    console.error('❌ stripeVerifyBalanceService: Nome do erro:', error instanceof Error ? error.name : 'N/A');
    console.error('❌ stripeVerifyBalanceService: Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('❌ stripeVerifyBalanceService: URL que falhou:', `${API_BASE_URL}/api/stripe/verify-balance`);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch";
    
    toast({
      title: "Erro ao verificar saldo",
      description: errorMessage,
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