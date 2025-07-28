-- Migration: Add email_sent columns to matriculas table
-- Date: 2024-01-25
-- Description: Adds email_sent and email_sent_at fields to control duplicate email sending

-- Adicionar coluna email_sent (boolean para controlar se email foi enviado)
ALTER TABLE matriculas 
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;

-- Adicionar coluna email_sent_at (timestamp de quando o email foi enviado)
ALTER TABLE matriculas 
ADD COLUMN email_sent_at TIMESTAMPTZ NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN matriculas.email_sent IS 'Indica se o email de compra foi enviado ao mentor para esta matrícula';
COMMENT ON COLUMN matriculas.email_sent_at IS 'Data e hora em que o email de compra foi enviado ao mentor';

-- Atualizar registros existentes para marcar como email não enviado
UPDATE matriculas 
SET email_sent = FALSE 
WHERE email_sent IS NULL;

-- Tornar a coluna email_sent NOT NULL após atualizar os registros existentes
ALTER TABLE matriculas 
ALTER COLUMN email_sent SET NOT NULL;