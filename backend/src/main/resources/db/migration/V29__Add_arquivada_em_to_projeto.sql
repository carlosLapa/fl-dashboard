-- V29__Add_arquivada_em_to_projeto.sql
-- Adds arquivada_em to tb_projeto: lets a CONCLUIDO projeto be hidden from the Projetos
-- listing without soft-deleting it — it must keep counting in metrics/reports (which only
-- filter on deleted_at), so this is a separate, independent column, mirroring V22 for tb_tarefa.

ALTER TABLE tb_projeto ADD COLUMN arquivada_em datetime(6) NULL;
