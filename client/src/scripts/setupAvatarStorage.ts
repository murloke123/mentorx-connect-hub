import { supabase } from '@/utils/supabase';

/**
 * Script para configurar o bucket de storage para avatares
 */
export async function setupAvatarStorage() {
  try {
    console.log('🔧 Configurando storage para avatares...');

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return false;
    }

    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Bucket "avatars" já existe');
    } else {
      console.log('📦 Criando bucket "avatars"...');
      
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true, // Bucket público para avatares
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        fileSizeLimit: 2097152 // 2MB em bytes
      });

      if (error) {
        console.error('❌ Erro ao criar bucket:', error);
        return false;
      }

      console.log('✅ Bucket "avatars" criado com sucesso');
    }

    console.log(`
📋 Políticas RLS necessárias para o bucket 'avatars':

Execute os seguintes comandos SQL no Supabase Dashboard > SQL Editor:

-- 1. Permitir que todos vejam avatares (bucket público)
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- 2. Permitir que usuários autenticados façam upload de avatares
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update own avatars" ON storage.objects 
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Permitir que usuários deletem seus próprios avatares
CREATE POLICY "Users can delete own avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

⚠️  IMPORTANTE: Execute essas políticas no SQL Editor do Supabase Dashboard.
    `);

    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar storage:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  setupAvatarStorage();
}