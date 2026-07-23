-- V18__Add_subtarefa_entity.sql
-- Adds tb_subtarefa: per-collaborator sub-task split of a tb_tarefa, used to gate
-- status transitions until all sub-tasks reach 100% completion.

CREATE TABLE IF NOT EXISTS `tb_subtarefa` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tarefa_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `descricao` varchar(500) DEFAULT NULL,
  `percentual` decimal(5,2) NOT NULL,
  `concluida` bit(1) NOT NULL DEFAULT b'0',
  `concluida_em` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_subtarefa_tarefa_id` (`tarefa_id`),
  KEY `idx_subtarefa_user_id` (`user_id`),
  CONSTRAINT `UK_subtarefa_tarefa_user` UNIQUE (`tarefa_id`, `user_id`),
  CONSTRAINT `FK_subtarefa_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`),
  CONSTRAINT `FK_subtarefa_user` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
