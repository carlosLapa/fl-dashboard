-- V17__Add_numero_to_cliente.sql
-- Add numero column to tb_cliente table with unique constraint

-- Step 1: Add column as nullable first
ALTER TABLE `tb_cliente`
ADD COLUMN `numero` INT NULL;

-- Step 2: Update existing rows with unique sequential numbers
-- This ensures each existing cliente gets a unique numero
SET @row_number = 0;
UPDATE `tb_cliente`
SET `numero` = (@row_number:=@row_number + 1)
WHERE `numero` IS NULL;

-- Step 3: Now make the column NOT NULL
ALTER TABLE `tb_cliente`
MODIFY COLUMN `numero` INT NOT NULL;

-- Step 4: Add unique constraint
ALTER TABLE `tb_cliente`
ADD CONSTRAINT `UK_cliente_numero` UNIQUE (`numero`);

-- Step 5: Add index for better query performance (optional, UNIQUE already creates an index)
-- The UNIQUE constraint already creates an index, so this is redundant
-- CREATE INDEX `idx_cliente_numero` ON `tb_cliente` (`numero`);