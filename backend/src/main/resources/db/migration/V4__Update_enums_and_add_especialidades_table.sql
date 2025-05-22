-- V4__Update_enums_and_add_especialidades_table.sql
-- Update fase_projeto enum in tb_externo to include new values

ALTER TABLE `tb_externo`
MODIFY COLUMN `fase_projeto` enum(
    'LICENCIAMENTO',
    'EXECUCAO',
    'COMUNICACAO_PREVIA',
    'ASSISTENCIA_TECNICA',
    'PROGRAMA_BASE',
    'ESTUDO_PREVIO',
    'PEDIDO_INFORMACAO_PREVIO'
) DEFAULT NULL;

-- Create the tb_externo_especialidades table
CREATE TABLE `tb_externo_especialidades` (
    `externo_id` BIGINT NOT NULL,
    `especialidade` enum(
        'ARQUEOLOGIA',
        'ARQUITETURA',
        'AVAC',
        'ELETRICA',
        'ITED',
        'REDES_AGUAS',
        'REDES_ESGOTOS',
        'REDES_PLUVIAIS',
        'REDES_INCENDIO',
        'TERMICA'
    ) NOT NULL,
    PRIMARY KEY (`externo_id`, `especialidade`),
    CONSTRAINT `fk_externo_especialidades_externo`
        FOREIGN KEY (`externo_id`)
        REFERENCES `tb_externo` (`id`)
);

-- Drop the old especialidade column since it's being replaced
ALTER TABLE `tb_externo` DROP COLUMN `especialidade`;
