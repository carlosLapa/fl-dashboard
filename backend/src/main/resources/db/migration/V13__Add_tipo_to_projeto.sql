-- V13__Add_tipo_to_projeto.sql


-- Adds the "tipo" column to the table 'tb_projeto'
ALTER TABLE `tb_projeto`
ADD COLUMN `tipo` ENUM(
    'ASSESSORIA',
    'CONSULTORIA',
    'FISCALIZACAO',
    'LEVANTAMENTO',
    'PROJETO',
    'REVISAO',
    'VISTORIA'
) DEFAULT NULL;