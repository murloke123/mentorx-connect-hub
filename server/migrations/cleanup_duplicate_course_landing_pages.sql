-- Migration: Cleanup duplicate records in course_landing_pages table
-- Date: 2024-01-25
-- Description: Remove duplicate records keeping only the most recent one for each course_id

-- Primeiro, vamos identificar e remover duplicatas mantendo apenas o registro mais recente
WITH duplicates AS (
  SELECT 
    id,
    course_id,
    ROW_NUMBER() OVER (
      PARTITION BY course_id 
      ORDER BY 
        updated_at DESC NULLS LAST,
        created_at DESC NULLS LAST,
        id DESC
    ) as row_num
  FROM course_landing_pages
  WHERE course_id IS NOT NULL
)
DELETE FROM course_landing_pages 
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Adicionar constraint única para evitar duplicatas futuras
-- (Apenas se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'course_landing_pages_course_id_unique'
  ) THEN
    ALTER TABLE course_landing_pages 
    ADD CONSTRAINT course_landing_pages_course_id_unique 
    UNIQUE (course_id);
  END IF;
END $$;

-- Adicionar comentário para documentação
COMMENT ON CONSTRAINT course_landing_pages_course_id_unique ON course_landing_pages 
IS 'Garante que cada curso tenha apenas uma landing page';

-- Verificar resultado da limpeza
SELECT 
  'Registros restantes por course_id:' as info,
  course_id,
  COUNT(*) as total_records
FROM course_landing_pages 
WHERE course_id IS NOT NULL
GROUP BY course_id
HAVING COUNT(*) > 1;