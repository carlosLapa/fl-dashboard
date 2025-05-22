-- V3__Add_externo_entity.sql
-- Create the tb_externo table

CREATE TABLE IF NOT EXISTS `tb_externo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telemovel` varchar(20) DEFAULT NULL,
  `especialidade` varchar(255) DEFAULT NULL,
  `preco` decimal(10,2) DEFAULT NULL,
  `fase_projeto` enum('LICENCIAMENTO','EXECUCAO','COMUNICACAO_PREVIA') DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_externo_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create junction table for Externo-Projeto relationship
CREATE TABLE IF NOT EXISTS `tb_projeto_externo` (
  `projeto_id` bigint NOT NULL,
  `externo_id` bigint NOT NULL,
  PRIMARY KEY (`projeto_id`,`externo_id`),
  KEY `FK_projeto_externo_externo` (`externo_id`),
  CONSTRAINT `FK_projeto_externo_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FK_projeto_externo_externo` FOREIGN KEY (`externo_id`) REFERENCES `tb_externo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create junction table for Externo-Tarefa relationship
CREATE TABLE IF NOT EXISTS `tb_tarefa_externo` (
  `tarefa_id` bigint NOT NULL,
  `externo_id` bigint NOT NULL,
  PRIMARY KEY (`tarefa_id`,`externo_id`),
  KEY `FK_tarefa_externo_externo` (`externo_id`),
  CONSTRAINT `FK_tarefa_externo_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`),
  CONSTRAINT `FK_tarefa_externo_externo` FOREIGN KEY (`externo_id`) REFERENCES `tb_externo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
