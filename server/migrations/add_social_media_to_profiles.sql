-- Adicionar campo social_media à tabela profiles
ALTER TABLE profiles 
ADD COLUMN social_media JSONB DEFAULT '{
  "instagram": "",
  "facebook": "",
  "youtube": ""
}'::jsonb;

-- Atualizar perfis existentes de mentores com valores padrão
UPDATE profiles 
SET social_media = '{
  "instagram": "",
  "facebook": "",
  "youtube": ""
}'::jsonb 
WHERE role = 'mentor' AND social_media IS NULL;