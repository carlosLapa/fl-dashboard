-- V30__Convert_projeto_proposta_status_to_enum.sql
-- Fixes projetos stuck with status='ADJUDICADA' (copied verbatim from the originating Proposta
-- by the old adjudicar-to-projeto mapper instead of being set to ATIVO), then narrows both
-- status columns to native MySQL ENUMs, following the same pattern already used for
-- tb_projeto.tipo (see V13/V19).

UPDATE tb_projeto SET status = 'ATIVO' WHERE status = 'ADJUDICADA';

ALTER TABLE tb_projeto
MODIFY COLUMN status ENUM('ATIVO', 'EM_PROGRESSO', 'CONCLUIDO', 'SUSPENSO') DEFAULT NULL;

ALTER TABLE tb_proposta
MODIFY COLUMN status ENUM('ATIVO', 'EM_ANALISE', 'ADJUDICADA', 'RECUSADA') DEFAULT NULL;
