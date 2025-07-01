import { verifyStripeAccountStatus } from '@/services/stripeClientService';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface StripeAccountStatus {
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useStripeAccountStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeAccountStatus>({
    isChecking: false,
    lastChecked: null,
    error: null
  });

  const saveStripeAccountToProfile = async (userId: string, account: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_onboarding_status: account.details_submitted ? 'completed' : 'pending',
          stripe_charges_enabled: account.charges_enabled,
          stripe_payouts_enabled: account.payouts_enabled,
          stripe_requirements: account.requirements,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Erro ao salvar dados da conta Stripe:', error);
        throw error;
      }

      console.log('✅ Dados da conta Stripe salvos no perfil');
    } catch (error) {
      console.error('❌ Erro ao salvar conta Stripe no perfil:', error);
      throw error;
    }
  };

  const checkAccountStatus = async (forceCheck = false) => {
    try {
      if (!user) {
        console.log('�� Usuário não logado - pulando verificação Stripe');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.stripe_account_id) {
        console.log('👤 Usuário não tem conta Stripe ou erro ao buscar perfil');
        return;
      }

      console.log('🔍 Verificando status da conta Stripe (verificação sempre ativa)...');

      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      console.log('📊 [DASHBOARD-AUTO-CHECK] Verificando status da conta Stripe via servidor...');

      const verificationResult = await verifyStripeAccountStatus(profile.stripe_account_id);

      if (verificationResult.success && verificationResult.account) {
        await saveStripeAccountToProfile(user.id, verificationResult.account);
        console.log('✅ Status da conta Stripe atualizado no dashboard');
        
        setStatus({
          isChecking: false,
          lastChecked: new Date(),
          error: null
        });
      } else {
        console.error('❌ Erro na verificação do status:', verificationResult.error);
        setStatus({
          isChecking: false,
          lastChecked: new Date(),
          error: verificationResult.error || 'Erro desconhecido'
        });
      }

    } catch (error) {
      console.error('❌ Erro inesperado na verificação do status:', error);
      setStatus({
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Erro inesperado'
      });
    }
  };

  useEffect(() => {
    if (user) {
    checkAccountStatus();
    }
  }, [user?.id]);

  return {
    status,
    checkAccountStatus
  };
}; 