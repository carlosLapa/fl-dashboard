-- V34__Add_tarefa_dias_estimados_and_data_conclusao.sql
-- Per-tarefa deviation (planned vs actual working days), recorded automatically:
--   dias_estimados: working days planned when the tarefa first had both dates; frozen afterwards,
--                   so later date changes show up as deviation instead of rewriting the plan.
--   data_conclusao: when the tarefa last moved to DONE; cleared if it leaves DONE.
--   entrada_revisao: when the tarefa last entered IN_REVIEW; NULL while not in review.
--   dias_em_revisao: working days spent in review, summed over every review round, so review
--                    time is kept apart from work time.
--   devolucoes:      times the tarefa left review without being approved.
ALTER TABLE tb_tarefa
    ADD COLUMN dias_estimados int NULL,
    ADD COLUMN data_conclusao datetime(6) NULL,
    ADD COLUMN entrada_revisao datetime(6) NULL,
    ADD COLUMN dias_em_revisao int NOT NULL DEFAULT 0,
    ADD COLUMN devolucoes int NOT NULL DEFAULT 0;

-- Existing tarefas: the best available plan is their current duration. data_conclusao stays NULL
-- (the real completion date was never recorded), so they show no deviation.
UPDATE tb_tarefa SET dias_estimados = working_days WHERE working_days IS NOT NULL;

-- Tarefas already in review: their real entry time is unknown, so their review time counts from
-- the deploy. Undercounts a little, but better than not counting it at all.
UPDATE tb_tarefa SET entrada_revisao = NOW(6) WHERE status = 'IN_REVIEW';
