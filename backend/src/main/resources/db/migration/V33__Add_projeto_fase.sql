-- V33__Add_projeto_fase.sql
-- Adds tb_projeto_fase (the phases of a projeto, drawn as rows of its Gantt timeline) and an optional
-- tb_tarefa.fase_id so each tarefa can be grouped under one phase. Existing tarefas keep fase_id NULL
-- ("sem fase"); no data migration needed.

CREATE TABLE IF NOT EXISTS `tb_projeto_fase` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projeto_id` bigint NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `ordem` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_projeto_fase_projeto_ordem` (`projeto_id`, `ordem`),
  CONSTRAINT `FK_projeto_fase_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `tb_tarefa`
  ADD COLUMN `fase_id` bigint DEFAULT NULL,
  ADD KEY `idx_tarefa_fase_id` (`fase_id`),
  ADD CONSTRAINT `FK_tarefa_projeto_fase` FOREIGN KEY (`fase_id`) REFERENCES `tb_projeto_fase` (`id`);
