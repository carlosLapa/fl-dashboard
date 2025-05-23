-- V5__Update_especialidades_externo_enum.sql
-- Update the especialidade enum in tb_externo_especialidades with the new values

ALTER TABLE `tb_externo_especialidades`
MODIFY COLUMN `especialidade` enum(
    'ACUSTICA',
    'ARQUEOLOGIA',
    'ARQUITETURA',
    'AVAC',
    'ESTABILIDADE',
    'ELETRICA',
    'ITED',
    'REDES_AGUAS',
    'REDES_ESGOTOS',
    'REDES_PLUVIAIS',
    'SEGURANCA_CONTRA_INCENDIOS',
    'TERMICA'
) NOT NULL;
