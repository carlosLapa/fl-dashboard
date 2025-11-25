-- V17__Add_numero_to_cliente.sql
-- Add numero column to tb_cliente table with unique constraint

ALTER TABLE `tb_cliente`
ADD COLUMN `numero` INT NOT NULL;

-- Add unique constraint to ensure numero is unique across all clientes
ALTER TABLE `tb_cliente`
ADD CONSTRAINT `UK_cliente_numero` UNIQUE (`numero`);

-- Add index for better query performance
CREATE INDEX `idx_cliente_numero` ON `tb_cliente` (`numero`);