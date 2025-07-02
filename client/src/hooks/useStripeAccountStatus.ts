import { verifyStripeAccountStatus } from '@/services/stripeClientService';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

interface StripeAccountStatus {
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
  stripe_onboarding_status: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
}

export const useStripeAccountStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StripeAccountStatus>({
    isChecking: false,
    lastChecked: null,
    error: null,
    stripe_onboarding_status: null,
    stripe_charges_enabled: null,
    stripe_payouts_enabled: null
  });

  const saveStripeAccountToProfile = async (userId: string, account: any) => {
    try {
      const newStatus = account.details_submitted ? 'completed' : 'pending';
      
      console.warn('💾 useStripeAccountStatus: SALVANDO NO BANCO:', {
        stripe_onboarding_status: newStatus,
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted
      });

      const { error } = await supabase
        .from('profiles')
        .update({
          stripe_onboarding_status: newStatus,
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

      console.warn('✅ useStripeAccountStatus: DADOS SALVOS COM SUCESSO - stripe_onboarding_status:', newStatus);
    } catch (error) {
      console.error('❌ Erro ao salvar conta Stripe no perfil:', error);
      throw error;
    }
  };

  const checkAccountStatus = async (forceCheck = false) => {
    try {
      if (!user) {
        console.log('👤 Usuário não logado - pulando verificação Stripe');
        return;
      }

      console.warn('🔄 useStripeAccountStatus: EXECUTANDO VERIFICAÇÃO - ' + new Date().toLocaleTimeString());

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_account_id, stripe_onboarding_status, stripe_charges_enabled, stripe_payouts_enabled')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.stripe_account_id) {
        console.log('👤 Usuário não tem conta Stripe ou erro ao buscar perfil');
        setStatus(prev => ({
          ...prev,
          stripe_onboarding_status: profile?.stripe_onboarding_status || null,
          stripe_charges_enabled: profile?.stripe_charges_enabled || null,
          stripe_payouts_enabled: profile?.stripe_payouts_enabled || null
        }));
        return;
      }

      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      console.log('📊 [useStripeAccountStatus] Verificando status da conta Stripe via servidor...');

      const verificationResult = await verifyStripeAccountStatus(profile.stripe_account_id);

      if (verificationResult.success && verificationResult.account) {
        await saveStripeAccountToProfile(user.id, verificationResult.account);
        console.log('✅ Status da conta Stripe atualizado');
        
        const newStatus = verificationResult.account.details_submitted ? 'completed' : 'pending';
        
        setStatus({
          isChecking: false,
          lastChecked: new Date(),
          error: null,
          stripe_onboarding_status: newStatus,
          stripe_charges_enabled: verificationResult.account.charges_enabled,
          stripe_payouts_enabled: verificationResult.account.payouts_enabled
        });

        console.warn('📊 useStripeAccountStatus: Status atual:', {
          stripe_onboarding_status: newStatus,
          charges_enabled: verificationResult.account.charges_enabled,
          payouts_enabled: verificationResult.account.payouts_enabled
        });

      } else {
        console.error('❌ Erro na verificação do status:', verificationResult.error);
        setStatus(prev => ({
          ...prev,
          isChecking: false,
          lastChecked: new Date(),
          error: verificationResult.error || 'Erro desconhecido'
        }));
      }

    } catch (error) {
      console.error('❌ Erro inesperado na verificação do status:', error);
      setStatus(prev => ({
        ...prev,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Erro inesperado'
      }));
    }
  };

  // Effect para verificação inicial
  useEffect(() => {
    if (user) {
      console.warn('🚀 useStripeAccountStatus: USUÁRIO LOGADO - Iniciando verificação inicial');
      checkAccountStatus();
    }
  }, [user?.id]);

  // Effect para polling contínuo
  useEffect(() => {
    if (!user) {
      console.warn('❌ useStripeAccountStatus: Usuário não logado - polling não iniciado');
      return;
    }

    // Se o status já está completed, não inicia o polling
    if (status.stripe_onboarding_status === 'completed') {
      console.warn('✅ useStripeAccountStatus: STATUS JÁ ESTÁ COMPLETED - POLLING NÃO INICIADO');
      return;
    }

    console.warn('🚀 useStripeAccountStatus: INICIANDO POLLING A CADA 30 SEGUNDOS (status não completed)');
    
    const interval = setInterval(() => {
      console.warn('⏰ useStripeAccountStatus: EXECUTANDO POLLING AUTOMÁTICO - ' + new Date().toLocaleTimeString());
      checkAccountStatus();
    }, 30000); // 30 segundos

    return () => {
      console.warn('🛑 useStripeAccountStatus: PARANDO POLLING');
      clearInterval(interval);
    };
  }, [user, status.stripe_onboarding_status]);

  return {
    status,
    checkAccountStatus
  };
}; 