import { toast } from '@/hooks/use-toast';

// Usa URL relativa já que frontend e backend estão na mesma porta
const API_BASE_URL = '';

export interface StripePayoutsData {
  totalPaidOut: number;
  currency: string;
  payoutsCount: number;
  success: boolean;
  message?: string;
}

export async function verifyStripePayouts(stripeAccountId: string): Promise<StripePayoutsData> {
  try {
    console.log('🔍 stripeVerifyPayoutsService: Verificando payouts para conta:', stripeAccountId);
    console.log('🌐 stripeVerifyPayoutsService: URL da API:', `${API_BASE_URL}/api/stripe/verify-payouts`);
    console.log('🌐 stripeVerifyPayoutsService: API_BASE_URL:', API_BASE_URL);
    console.log('🌐 stripeVerifyPayoutsService: VITE_API_URL:', import.meta.env.VITE_API_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const response = await fetch(`${API_BASE_URL}/api/stripe/verify-payouts`, {
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

    console.log('📡 stripeVerifyPayoutsService: Response status:', response.status);
    console.log('📡 stripeVerifyPayoutsService: Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ stripeVerifyPayoutsService: Erro na resposta:', errorData);
      throw new Error(errorData.message || 'Erro ao verificar payouts');
    }

    const data = await response.json();
    console.log('✅ stripeVerifyPayoutsService: Payouts verificados com sucesso');

    return {
      totalPaidOut: data.totalPaidOut || 0,
      currency: data.currency || 'brl',
      payoutsCount: data.payoutsCount || 0,
      success: true,
      message: data.message
    };

  } catch (error) {
    console.error('❌ stripeVerifyPayoutsService: Erro ao verificar payouts:', error);
    console.error('❌ stripeVerifyPayoutsService: Tipo do erro:', typeof error);
    console.error('❌ stripeVerifyPayoutsService: Nome do erro:', error instanceof Error ? error.name : 'N/A');
    console.error('❌ stripeVerifyPayoutsService: Stack trace:', error instanceof Error ? error.stack : 'N/A');
    console.error('❌ stripeVerifyPayoutsService: URL que falhou:', `${API_BASE_URL}/api/stripe/verify-payouts`);
    
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch";
    
    toast({
      title: "Erro ao verificar pagamentos",
      description: errorMessage,
      variant: "destructive",
    });

    return {
      totalPaidOut: 0,
      currency: 'brl',
      payoutsCount: 0,
      success: false,
      message: errorMessage
    };
  }
} 