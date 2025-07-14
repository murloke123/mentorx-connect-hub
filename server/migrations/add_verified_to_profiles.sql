-- Adicionar campo verified à tabela profiles
ALTER TABLE profiles 
ADD COLUMN verified JSONB DEFAULT '{
  "cards_sucesso_verificado": false,
  "por_que_me_seguir_verificado": false,
  "meus_cursos_verificado": false,
  "elogios_verificado": false,
  "calendario_verificado": false
}'::jsonb;

-- Atualizar perfis existentes com valores padrão
UPDATE profiles 
SET verified = '{
  "cards_sucesso_verificado": false,
  "por_que_me_seguir_verificado": false,
  "meus_cursos_verificado": false,
  "elogios_verificado": false,
  "calendario_verificado": false
}'::jsonb 
WHERE verified IS NULL;