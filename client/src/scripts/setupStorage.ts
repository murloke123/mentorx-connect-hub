import { supabase } from '@/utils/supabase';

/**
 * Script para configurar o bucket de storage para documentos
 */
export async function setupDocumentStorage() {
  try {
    console.log('🔧 Configurando storage para documentos...');

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return false;
    }

    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
    
    if (documentsBucket) {
      console.log('✅ Bucket "documents" já existe');
      return true;
    }

    // Criar o bucket se não existir
    const { data: bucket, error: createError } = await supabase.storage.createBucket('documents', {
      public: false, // Documentos são privados
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB conforme diretrizes da Stripe
    });

    if (createError) {
      console.error('❌ Erro ao criar bucket:', createError);
      return false;
    }

    console.log('✅ Bucket "documents" criado com sucesso:', bucket);

    // Configurar políticas RLS para o bucket
    console.log('🔒 Configurando políticas de segurança...');
    
    // Nota: As políticas RLS devem ser configuradas no painel do Supabase
    // ou via SQL. Aqui apenas informamos sobre a necessidade.
    console.log(`
📋 Políticas RLS necessárias para o bucket 'documents':

1. SELECT: Usuários podem ver apenas seus próprios documentos
   CREATE POLICY "Users can view own documents" ON storage.objects 
   FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

2. INSERT: Usuários podem fazer upload apenas em sua própria pasta
   CREATE POLICY "Users can upload own documents" ON storage.objects 
   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

3. UPDATE: Usuários podem atualizar apenas seus próprios documentos
   CREATE POLICY "Users can update own documents" ON storage.objects 
   FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

4. DELETE: Usuários podem deletar apenas seus próprios documentos
   CREATE POLICY "Users can delete own documents" ON storage.objects 
   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);

⚠️  Execute essas políticas no SQL Editor do Supabase Dashboard.
    `);

    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

// Esta função é chamada sob demanda pelos componentes, 
// não há necessidade de executar automaticamente
export default setupDocumentStorage;
