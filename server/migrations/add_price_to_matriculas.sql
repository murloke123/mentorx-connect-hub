-- Migration: Add price column to matriculas table
-- Date: 2024-01-25
-- Description: Adds a price field to store the course price at the time of enrollment

ALTER TABLE matriculas 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0;

-- Add comment to the column
COMMENT ON COLUMN matriculas.price IS 'Price of the course at the time of enrollment';

-- Update existing records to set price to 0 (for free courses or unknown prices)
UPDATE matriculas SET price = 0 WHERE price IS NULL;