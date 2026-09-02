-- V27__Add_tarefa_link_entity.sql
-- Adds tb_tarefa_link: shared links (e.g. OneDrive) attached to a tb_tarefa, each with an
-- optional short description so users know what the link is about.

CREATE TABLE IF NOT EXISTS `tb_tarefa_link` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tarefa_id` bigint NOT NULL,
  `url` varchar(500) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tarefa_link_tarefa_id` (`tarefa_id`),
  CONSTRAINT `FK_tarefa_link_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
