-- V21__Add_projeto_user_history.sql
-- Adds tb_projeto_user_history: an audit trail of when a User was added to
-- or removed from a Projeto (tb_projeto_user has no such history). Populated
-- going forward only from ProjetoService - there is no way to reconstruct
-- past assignments, so history starts empty for existing projects/users.

CREATE TABLE IF NOT EXISTS `tb_projeto_user_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projeto_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `action` varchar(10) NOT NULL,
  `event_date` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projeto_user_history_user` (`user_id`, `event_date`),
  KEY `idx_projeto_user_history_projeto` (`projeto_id`, `event_date`),
  CONSTRAINT `FK_projeto_user_history_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FK_projeto_user_history_user` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
