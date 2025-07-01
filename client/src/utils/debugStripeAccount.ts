import { supabase } from '@/utils/supabase';

/**
 * Função de debug para verificar stripe_account_id de usuários
 */
export const debugStripeAccount = async () => {
  try {
    console.log('🔍 ===== DEBUG STRIPE ACCOUNTS =====');
    
    // Buscar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Usuário não logado:', userError);
      return;
    }
    
    console.log('👤 Usuário atual:', {
      id: user.id,
      email: user.email
    });
    
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    console.log('📋 Perfil completo:', profile);
    
    if (profile?.stripe_account_id) {
      console.log('✅ STRIPE ACCOUNT ID ENCONTRADO:', profile.stripe_account_id);
    } else {
      console.log('⚠️ STRIPE ACCOUNT ID NÃO ENCONTRADO');
    }
    
    // Buscar outros usuários com stripe_account_id (para debug)
    const { data: usersWithStripe, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, stripe_account_id')
      .not('stripe_account_id', 'is', null)
      .limit(5);
    
    if (!usersError && usersWithStripe) {
      console.log('👥 Usuários com Stripe Account ID:', usersWithStripe);
    }
    
    console.log('===== FIM DEBUG =====');
    
    return {
      currentUser: user,
      profile,
      hasStripeAccount: !!profile?.stripe_account_id,
      stripeAccountId: profile?.stripe_account_id
    };
    
  } catch (error: any) {
    console.error('💥 ERRO NO DEBUG:', error);
    return null;
  }
};
