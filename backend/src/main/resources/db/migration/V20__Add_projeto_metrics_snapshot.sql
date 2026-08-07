-- V20__Add_projeto_metrics_snapshot.sql
-- Adds tb_projeto_metrics_snapshot: point-in-time captures of a project's
-- metrics (KPIs only, not the granular per-task/per-collaborator breakdown),
-- used to compare e.g. completion rate across two dates. Manual trigger only
-- for now (trigger_type is prepared for a future 'SCHEDULED' value).

CREATE TABLE IF NOT EXISTS `tb_projeto_metrics_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projeto_id` bigint NOT NULL,
  `snapshot_date` date NOT NULL,
  `total_tarefas` int NOT NULL,
  `tarefas_concluidas` int NOT NULL,
  `tarefas_em_progresso` int NOT NULL,
  `tarefas_pendentes` int NOT NULL,
  `tempo_medio_dias` decimal(6,2) DEFAULT NULL,
  `taxa_conclusao` decimal(5,2) DEFAULT NULL,
  `trigger_type` varchar(20) NOT NULL,
  `triggered_by_user_id` bigint DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_snapshot_projeto_date` (`projeto_id`, `snapshot_date`),
  CONSTRAINT `FK_snapshot_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FK_snapshot_triggered_by_user` FOREIGN KEY (`triggered_by_user_id`) REFERENCES `tb_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
