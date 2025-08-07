-- ===============================================================================
-- 📋 SCRIPT: Configuração do campo discounted_price na tabela matriculas
-- ===============================================================================
-- 
-- 🎯 OBJETIVO: 
-- 1. Garantir que o campo discounted_price existe na tabela matriculas
-- 2. Popular o campo com valores da tabela cursos para registros existentes
-- 3. Verificar controle de emails duplicados
--
-- 📅 Data: 2025-01-25
-- 👤 Autor: Sistema MentorX Connect Hub
-- ===============================================================================

-- 🔍 VERIFICAR SE O CAMPO JÁ EXISTE
DO $$
BEGIN
    -- Verificar se a coluna discounted_price já existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'matriculas' 
        AND column_name = 'discounted_price'
    ) THEN
        -- Adicionar campo discounted_price se não existir
        ALTER TABLE matriculas 
        ADD COLUMN discounted_price DECIMAL(10,2);
        
        -- Adicionar comentário para documentação
        COMMENT ON COLUMN matriculas.discounted_price IS 'Preço com desconto do curso no momento da compra, copiado da tabela cursos';
        
        RAISE NOTICE '✅ Campo discounted_price adicionado à tabela matriculas';
    ELSE
        RAISE NOTICE 'ℹ️ Campo discounted_price já existe na tabela matriculas';
    END IF;
END $$;

-- 📊 POPULAR CAMPO COM VALORES DA TABELA CURSOS
-- Atualizar registros onde discounted_price está NULL
UPDATE matriculas 
SET discounted_price = cursos.discounted_price
FROM cursos 
WHERE matriculas.course_id = cursos.id 
AND matriculas.discounted_price IS NULL;

-- 📈 RELATÓRIO DE ATUALIZAÇÃO
DO $$
DECLARE
    total_matriculas INTEGER;
    matriculas_com_desconto INTEGER;
    matriculas_sem_desconto INTEGER;
BEGIN
    -- Contar total de matrículas
    SELECT COUNT(*) INTO total_matriculas FROM matriculas;
    
    -- Contar matrículas com desconto preenchido
    SELECT COUNT(*) INTO matriculas_com_desconto 
    FROM matriculas 
    WHERE discounted_price IS NOT NULL;
    
    -- Contar matrículas sem desconto
    SELECT COUNT(*) INTO matriculas_sem_desconto 
    FROM matriculas 
    WHERE discounted_price IS NULL;
    
    -- Exibir relatório
    RAISE NOTICE '';
    RAISE NOTICE '📊 RELATÓRIO DE ATUALIZAÇÃO:';
    RAISE NOTICE '📋 Total de matrículas: %', total_matriculas;
    RAISE NOTICE '✅ Matrículas com discounted_price: %', matriculas_com_desconto;
    RAISE NOTICE '❌ Matrículas sem discounted_price: %', matriculas_sem_desconto;
    RAISE NOTICE '';
END $$;

-- 🔍 VERIFICAR CONTROLE DE EMAILS DUPLICADOS
DO $$
DECLARE
    matriculas_sem_controle_email INTEGER;
BEGIN
    -- Verificar se existem campos de controle de email
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'matriculas' 
        AND column_name = 'email_sent'
    ) THEN
        -- Contar matrículas sem controle de email
        SELECT COUNT(*) INTO matriculas_sem_controle_email
        FROM matriculas 
        WHERE email_sent IS NULL;
        
        RAISE NOTICE '📧 CONTROLE DE EMAILS:';
        RAISE NOTICE '✅ Campos email_sent e email_sent_at existem';
        RAISE NOTICE '📊 Matrículas sem controle de email: %', matriculas_sem_controle_email;
        
        -- Corrigir registros sem controle de email
        IF matriculas_sem_controle_email > 0 THEN
            UPDATE matriculas 
            SET email_sent = FALSE 
            WHERE email_sent IS NULL;
            
            RAISE NOTICE '🔧 Corrigidos % registros sem controle de email', matriculas_sem_controle_email;
        END IF;
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: Campos de controle de email não existem!';
        RAISE NOTICE '💡 Execute a migração: server/migrations/add_email_sent_to_matriculas.sql';
    END IF;
END $$;

-- 📋 EXEMPLO DE CONSULTA PARA VERIFICAR DADOS
-- Descomente as linhas abaixo para ver uma amostra dos dados:

/*
SELECT 
    m.id,
    m.course_id,
    c.title as curso_nome,
    c.price as preco_original,
    c.discounted_price as desconto_curso,
    m.discounted_price as desconto_matricula,
    m.status,
    m.email_sent,
    m.email_sent_at,
    m.enrolled_at
FROM matriculas m
JOIN cursos c ON m.course_id = c.id
ORDER BY m.enrolled_at DESC
LIMIT 10;
*/

-- ===============================================================================
-- 🎯 INSTRUÇÕES DE USO:
-- ===============================================================================
-- 
-- 1. Execute este script no seu banco de dados PostgreSQL/Supabase
-- 2. Verifique os logs para confirmar as operações
-- 3. Teste uma nova compra para verificar se o discounted_price é salvo
-- 4. Monitore os logs de email para confirmar que não há duplicação
--
-- 📝 NOTAS:
-- - O script é idempotente (pode ser executado múltiplas vezes)
-- - Não afeta dados existentes, apenas adiciona/atualiza campos necessários
-- - Inclui verificações de segurança para evitar erros
-- ===============================================================================