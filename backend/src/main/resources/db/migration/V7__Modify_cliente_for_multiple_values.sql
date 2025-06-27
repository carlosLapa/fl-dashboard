-- V7__Modify_cliente_for_multiple_values.sql

-- Step 1: Add new JSON columns for collections
ALTER TABLE `tb_cliente`
ADD COLUMN `contactos` JSON DEFAULT NULL,
ADD COLUMN `responsaveis` JSON DEFAULT NULL,
ADD COLUMN `emails` JSON DEFAULT NULL;

-- Step 2: Migrate existing data to the new columns
-- Convert single values to JSON arrays with one element
UPDATE `tb_cliente`
SET
  `contactos` = JSON_ARRAY(contacto),
  `responsaveis` = JSON_ARRAY(responsavel)
WHERE contacto IS NOT NULL OR responsavel IS NOT NULL;

-- Step 3: Drop the old columns
ALTER TABLE `tb_cliente`
DROP COLUMN `contacto`,
DROP COLUMN `responsavel`;
