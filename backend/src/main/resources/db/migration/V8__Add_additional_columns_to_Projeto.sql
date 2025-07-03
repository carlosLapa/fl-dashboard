-- Add new columns to tb_projeto
ALTER TABLE `tb_projeto`
ADD COLUMN `coordenador_id` BIGINT NULL,
ADD COLUMN `data_proposta` TIMESTAMP NULL,
ADD COLUMN `data_adjudicacao` TIMESTAMP NULL;

-- Add foreign key constraint for coordenador
ALTER TABLE `tb_projeto`
ADD CONSTRAINT `fk_projeto_coordenador`
FOREIGN KEY (`coordenador_id`) REFERENCES `tb_user` (`id`);