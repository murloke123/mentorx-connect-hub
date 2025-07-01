import { supabase } from './supabase';

/**
 * Força a atualização do status de verificação para um usuário
 * Útil quando sabemos que a conta Stripe já está verificada
 */
export const forceUpdateVerificationStatus = async (
  userId: string, 
  status: 'verified' | 'pending' | 'rejected' = 'verified'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Forçando atualização do status de verificação...');
    console.log('📋 User ID:', userId);
    console.log('📋 Novo status:', status);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        document_verification_status: status,
        account_already_verified: status === 'verified',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Status de verificação atualizado com sucesso!');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Erro crítico:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca status atual de verificação de um usuário
 */
export const getVerificationStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, document_verification_status, account_already_verified, stripe_charges_enabled, stripe_payouts_enabled')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar status:', error);
      return null;
    }

    console.log('📊 Status atual do usuário:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro crítico ao buscar status:', error);
    return null;
  }
};

/**
 * Busca usuário por email e atualiza status
 */
export const updateVerificationByEmail = async (
  email: string, 
  status: 'verified' | 'pending' | 'rejected' = 'verified'
) => {
  try {
    console.log('🔍 Buscando usuário por email:', email);
    
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name, document_verification_status, account_already_verified')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      console.error('❌ Usuário não encontrado:', email);
      return { success: false, error: 'Usuário não encontrado' };
    }

    console.log('👤 Usuário encontrado:', user);
    
    return await forceUpdateVerificationStatus(user.id, status);
    
  } catch (error: any) {
    console.error('❌ Erro crítico:', error);
    return { success: false, error: error.message };
  }
};

// Função global para usar no console do navegador
if (typeof window !== 'undefined') {
  (window as any).updateMentor1Verification = async () => {
    console.log('🚀 Iniciando atualização manual para mentor1@teste.com...');
    const result = await updateVerificationByEmail('mentor1@teste.com', 'verified');
    
    if (result.success) {
      console.log('🎉 Sucesso! Recarregue a página para ver as mudanças.');
      alert('Status atualizado com sucesso! Recarregue a página.');
    } else {
      console.error('💥 Falha:', result.error);
      alert(`Erro: ${result.error}`);
    }
    
    return result;
  };
  
  // Para debug geral
  (window as any).checkUserVerification = async (email: string) => {
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    console.log('📊 Dados completos do usuário:', user);
    return user;
  };
} 