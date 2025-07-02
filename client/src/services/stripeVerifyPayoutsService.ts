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