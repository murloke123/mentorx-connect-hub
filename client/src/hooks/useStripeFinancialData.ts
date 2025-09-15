import { verifyStripeBalance } from '@/services/stripeVerifyBalanceService';
import { verifyStripePayouts } from '@/services/stripeVerifyPayoutsService';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface StripeFinancialData {
  pendingAmount: number;
  paidAmount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useStripeFinancialData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StripeFinancialData>({
    pendingAmount: 0,
    paidAmount: 0,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const fetchStripeFinancialData = async () => {
    if (!user) {
      console.warn('🚫 useStripeFinancialData: Usuário não logado');
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('🚀 useStripeFinancialData: Iniciando busca de dados financeiros do Stripe');
      console.warn('🌐 useStripeFinancialData: Environment info:', {
        userAgent: navigator.userAgent,
        location: window.location.href,
        timestamp: new Date().toISOString()
      });

      // Buscar stripe_account_id do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', user.id)
        .single();

      console.warn('📡 useStripeFinancialData: Supabase response:', {
        profile,
        error: profileError,
        userId: user.id
      });

      if (profileError) {
        console.error('❌ useStripeFinancialData: Erro no Supabase:', profileError);
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
      }

      if (!profile?.stripe_account_id) {
        console.warn('⚠️ useStripeFinancialData: stripe_account_id não encontrado no perfil');
        setData(prev => ({ 
          ...prev, 
          pendingAmount: 0, 
          paidAmount: 0, 
          isLoading: false,
          error: 'Conta Stripe não configurada',
          lastUpdated: new Date()
        }));
        return;
      }

      console.log('🔍 useStripeFinancialData: stripe_account_id encontrado:', profile.stripe_account_id);

      // Buscar dados do Stripe em paralelo
      console.log('📡 useStripeFinancialData: Chamando serviços do Stripe...');
      console.warn('🚀 useStripeFinancialData: Iniciando chamadas paralelas para Stripe...');
      
      const [balanceResult, payoutsResult] = await Promise.all([
        verifyStripeBalance(profile.stripe_account_id),
        verifyStripePayouts(profile.stripe_account_id)
      ]);

      console.log('💰 useStripeFinancialData: RESULTADO BALANCE (saldo pendente):', balanceResult);
      console.log('💸 useStripeFinancialData: RESULTADO PAYOUTS (valores pagos):', payoutsResult);
      console.warn('📊 useStripeFinancialData: Resultados obtidos:', {
        balance: balanceResult,
        payouts: payoutsResult
      });

      // Log para Network do Chrome
      await fetch('/api/stripe-network-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STRIPE_FINANCIAL_DATA',
          action: 'FETCH_COMPLETE',
          data: {
            balance: balanceResult,
            payouts: payoutsResult,
            timestamp: new Date().toISOString()
          },
          timestamp: Date.now()
        })
      });

      setData({
        pendingAmount: balanceResult.success ? balanceResult.pendingAmount : 0,
        paidAmount: payoutsResult.success ? payoutsResult.totalPaidOut : 0,
        isLoading: false,
        error: (!balanceResult.success || !payoutsResult.success) ? 
          'Erro ao buscar alguns dados do Stripe' : null,
        lastUpdated: new Date()
      });

      console.log('✅ useStripeFinancialData: Dados atualizados com sucesso:', {
        pendingAmount: balanceResult.pendingAmount,
        paidAmount: payoutsResult.totalPaidOut
      });

    } catch (error: any) {
      console.error('❌ useStripeFinancialData: Erro ao buscar dados financeiros:', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack,
        errorType: typeof error,
        timestamp: new Date().toISOString(),
        location: window.location.href,
        userAgent: navigator.userAgent
      });
      
      // Log do erro original para debug completo
      console.error('🔍 useStripeFinancialData: Original Error Object:', error);
      
      // Tentar capturar mais detalhes se for um erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 useStripeFinancialData: Network Error Details:', {
          message: error.message,
          cause: error.cause,
          isNetworkError: true
        });
      }
      
      setData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }));
    }
  };

  // Buscar dados quando o componente monta
  useEffect(() => {
    if (user) {
      fetchStripeFinancialData();
    }
  }, [user?.id]);

  return {
    ...data,
    refetch: fetchStripeFinancialData
  };
};