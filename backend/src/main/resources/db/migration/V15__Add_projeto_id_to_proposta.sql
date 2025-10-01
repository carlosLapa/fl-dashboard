-- V15__Add_projeto_id_to_proposta.sql
-- Add projeto_id column to tb_proposta table and set up foreign key constraint

ALTER TABLE `tb_proposta`
ADD COLUMN `projeto_id` BIGINT DEFAULT NULL,
ADD CONSTRAINT `FK_proposta_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`);