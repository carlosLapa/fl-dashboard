ALTER TABLE tb_tarefa ADD COLUMN recorrente BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tb_tarefa ADD COLUMN frequencia_recorrencia VARCHAR(20) NULL;
ALTER TABLE tb_tarefa ADD COLUMN data_fim_recorrencia DATE NULL;
ALTER TABLE tb_tarefa ADD COLUMN proxima_ocorrencia DATE NULL;
ALTER TABLE tb_tarefa ADD COLUMN tarefa_origem_id BIGINT NULL;
CREATE INDEX idx_tarefa_recorrencia_due ON tb_tarefa (recorrente, proxima_ocorrencia);