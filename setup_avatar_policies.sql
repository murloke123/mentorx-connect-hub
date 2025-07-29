-- Políticas RLS para o bucket 'avatars'
-- Execute estes comandos no Supabase Dashboard > SQL Editor

-- 1. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- 2. Permitir que todos vejam avatares (bucket público)
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- 3. Permitir que usuários autenticados façam upload de avatares
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 4. Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Users can update own avatars" ON storage.objects 
FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 5. Permitir que usuários deletem seus próprios avatares
CREATE POLICY "Users can delete own avatars" ON storage.objects 
FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 6. Verificar se o bucket existe e criar se necessário
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;