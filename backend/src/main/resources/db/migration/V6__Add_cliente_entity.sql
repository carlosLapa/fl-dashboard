-- V6__Add_cliente_entity.sql

-- Create the tb_cliente table
CREATE TABLE IF NOT EXISTS `tb_cliente` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `morada` varchar(255) DEFAULT NULL,
  `nif` varchar(20) DEFAULT NULL,
  `contacto` varchar(50) DEFAULT NULL,
  `responsavel` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_cliente_nif` (`nif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add index on deleted_at for better performance on soft delete queries
CREATE INDEX `idx_cliente_deleted_at` ON `tb_cliente` (`deleted_at`);

-- Add cliente_id column to tb_projeto
ALTER TABLE `tb_projeto` ADD COLUMN `cliente_id` bigint DEFAULT NULL;

-- Add index on cliente_id for better performance
CREATE INDEX `idx_projeto_cliente` ON `tb_projeto` (`cliente_id`);

-- Add foreign key constraint
ALTER TABLE `tb_projeto`
ADD CONSTRAINT `FK_projeto_cliente`
FOREIGN KEY (`cliente_id`) REFERENCES `tb_cliente` (`id`)
ON DELETE SET NULL;
