import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

    const response = await fetch(`${API_BASE_URL}/api/stripe/verify-payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stripeAccountId: stripeAccountId
      })
    });

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
    
    toast({
      title: "Erro ao verificar pagamentos",
      description: error instanceof Error ? error.message : "Não foi possível verificar os pagamentos realizados",
      variant: "destructive",
    });

    return {
      totalPaidOut: 0,
      currency: 'brl',
      payoutsCount: 0,
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
} 