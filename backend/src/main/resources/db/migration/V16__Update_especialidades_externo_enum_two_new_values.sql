-- V16__Update_especialidades_externo_enum_two_new_values
-- Update the especialidades enum to include new values: INSPECOES and ARQUITETURA_PAISAGISTICA

-- Modify the enum values for the especialidade column in tb_externo_especialidades
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
    'TERMICA',
    'INSPECOES',
    'ARQUITETURA_PAISAGISTICA'
) NOT NULL;