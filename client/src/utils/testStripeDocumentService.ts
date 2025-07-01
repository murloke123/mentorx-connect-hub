import { getUserStripeAccountId, uploadAndAssociateDocument } from '@/services/stripeDocumentService';

/**
 * Teste direto das funções do Stripe Document Service
 */
export const testStripeDocumentService = async () => {
  console.log('🧪 ===== TESTE DIRETO DO STRIPE DOCUMENT SERVICE =====');
  
  // User ID encontrado no banco
  const testUserId = '5d79415f-85da-4a5e-aae0-8d85d9e7aa78';
  const expectedStripeAccountId = 'acct_1RbiQsIZuDz3vHCX';
  
  try {
    // Teste 1: Buscar stripe_account_id
    console.log('🔍 TESTE 1: Buscando stripe_account_id...');
    const stripeAccountId = await getUserStripeAccountId(testUserId);
    
    console.log('📊 RESULTADO:', {
      userId: testUserId,
      stripeAccountId,
      expected: expectedStripeAccountId,
      match: stripeAccountId === expectedStripeAccountId
    });
    
    if (stripeAccountId) {
      console.log('✅ TESTE 1 PASSOU: stripe_account_id encontrado');
    } else {
      console.error('❌ TESTE 1 FALHOU: stripe_account_id não encontrado');
    }
    
    return {
      success: !!stripeAccountId,
      userId: testUserId,
      stripeAccountId,
      expected: expectedStripeAccountId
    };
    
  } catch (error: any) {
    console.error('💥 ERRO NO TESTE:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Teste completo com arquivo mock
 */
export const testCompleteUploadFlow = async (file?: File) => {
  console.log('🚀 ===== TESTE COMPLETO DE UPLOAD =====');
  
  const testUserId = '5d79415f-85da-4a5e-aae0-8d85d9e7aa78';
  
  if (!file) {
    console.log('⚠️ Nenhum arquivo fornecido para teste');
    return { success: false, error: 'Arquivo necessário para teste' };
  }
  
  try {
    const result = await uploadAndAssociateDocument(
      file,
      testUserId,
      'front',
      'identity_document'
    );
    
    console.log('📊 RESULTADO COMPLETO:', result);
    return result;
    
  } catch (error: any) {
    console.error('💥 ERRO NO TESTE COMPLETO:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
