-- V19__Update_tipo_projeto_enum_add_new_values.sql
-- Update the tipo enum in tb_projeto to include new values: ADMINISTRACAO, MARKETING, INOVACAO, CONCURSOS

ALTER TABLE `tb_projeto`
MODIFY COLUMN `tipo` ENUM(
    'ASSESSORIA',
    'CONSULTORIA',
    'FISCALIZACAO',
    'LEVANTAMENTO',
    'PROJETO',
    'REVISAO',
    'VISTORIA',
    'ADMINISTRACAO',
    'MARKETING',
    'INOVACAO',
    'CONCURSOS'
) DEFAULT NULL;
