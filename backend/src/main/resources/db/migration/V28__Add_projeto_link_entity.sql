-- V28__Add_projeto_link_entity.sql
-- Adds tb_projeto_link: shared links (e.g. OneDrive) attached to a tb_projeto, each with an
-- optional short description so users know what the link is about.

CREATE TABLE IF NOT EXISTS `tb_projeto_link` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `projeto_id` bigint NOT NULL,
  `url` varchar(500) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projeto_link_projeto_id` (`projeto_id`),
  CONSTRAINT `FK_projeto_link_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
