-- Adicionar coluna created_at à tabela profiles
-- Esta migração adiciona a coluna created_at com valor padrão para novos registros
-- e define a data atual para registros existentes

-- Adicionar a coluna created_at com valor padrão
ALTER TABLE profiles 
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();

-- Atualizar registros existentes com a data atual
UPDATE profiles 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Tornar a coluna NOT NULL após atualizar os registros existentes
ALTER TABLE profiles 
ALTER COLUMN created_at SET NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN profiles.created_at IS 'Data e hora de criação do perfil do usuário';