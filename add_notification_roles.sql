-- Script para adicionar campos de role na tabela notifications
-- Execute este script no banco de dados para adicionar os novos campos

-- Adicionar coluna sender_role
ALTER TABLE notifications 
ADD COLUMN sender_role VARCHAR(20);

-- Adicionar coluna receiver_role  
ALTER TABLE notifications 
ADD COLUMN receiver_role VARCHAR(20);

-- Adicionar comentários para documentação
COMMENT ON COLUMN notifications.sender_role IS 'Role do usuário que envia a notificação (mentor/mentorado)';
COMMENT ON COLUMN notifications.receiver_role IS 'Role do usuário que recebe a notificação (mentor/mentorado)';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('sender_role', 'receiver_role');