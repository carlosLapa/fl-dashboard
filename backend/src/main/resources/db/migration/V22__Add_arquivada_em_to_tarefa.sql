-- V22__Add_arquivada_em_to_tarefa.sql
-- Adds arquivada_em to tb_tarefa: lets a DONE tarefa be hidden from the Kanban board and the
-- Tarefas table without soft-deleting it — it must keep counting in project/collaborator metrics
-- (which only filter on deleted_at), so this is a separate, independent column.

ALTER TABLE tb_tarefa ADD COLUMN arquivada_em datetime(6) NULL;
