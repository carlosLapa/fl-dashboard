-- V23__Add_version_to_tarefa.sql
-- Adds an optimistic-locking version counter to tb_tarefa. Hibernate's @Version
-- requires a non-null value, so existing rows default to 0 rather than being left NULL.

ALTER TABLE tb_tarefa ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
