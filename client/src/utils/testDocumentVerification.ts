import { supabase } from './supabase';

/**
 * Script para testar a funcionalidade de ocultação de elementos
 * quando document_verification_status for 'verified'
 */

export const testDocumentVerificationStatus = async () => {
  console.log('🧪 Iniciando teste de verificação de documentos...');
  
  try {
    // 1. Buscar o usuário mentor1@teste.com
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'mentor1@teste.com')
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }

    if (!profile) {
      console.error('❌ Usuário mentor1@teste.com não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:', {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      document_verification_status: profile.document_verification_status
    });

    // 2. Verificar o status atual
    const currentStatus = profile.document_verification_status;
    console.log(`📋 Status atual: ${currentStatus || 'null'}`);

    // 3. Se não estiver verified, definir como verified para teste
    if (currentStatus !== 'verified') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ document_verification_status: 'verified' })
        .eq('id', profile.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        return;
      }

      console.log('✅ Status atualizado para "verified"');
    } else {
      console.log('✅ Status já está como "verified"');
    }

    // 4. Verificar se a atualização foi aplicada
    const { data: updatedProfile, error: checkError } = await supabase
      .from('profiles')
      .select('document_verification_status')
      .eq('id', profile.id)
      .single();

    if (checkError) {
      console.error('❌ Erro ao verificar atualização:', checkError);
      return;
    }

    console.log('🔍 Status após atualização:', updatedProfile.document_verification_status);
    
    console.log('\n📝 Teste concluído! Agora você pode:');
    console.log('1. Fazer login com mentor1@teste.com');
    console.log('2. Acessar a página de onboarding');
    console.log('3. Verificar se os elementos estão ocultos no step 4');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
};

export const resetDocumentVerificationStatus = async () => {
  console.log('🔄 Resetando status de verificação...');
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ document_verification_status: null })
      .eq('email', 'mentor1@teste.com');

    if (error) {
      console.error('❌ Erro ao resetar status:', error);
      return;
    }

    console.log('✅ Status resetado (null)');
  } catch (error) {
    console.error('❌ Erro geral ao resetar:', error);
  }
};

// Função para executar no console do navegador
export const runTest = () => {
  console.log('🚀 Executando teste de verificação de documentos...');
  testDocumentVerificationStatus();
};

export const resetTest = () => {
  console.log('🔄 Resetando teste...');
  resetDocumentVerificationStatus();
};
