-- V32__Add_equipamento_and_requisicao.sql
-- Adds tb_equipamento (catalogue of requisitionable material; one row per physical unit, so two
-- iPads are two rows) and tb_requisicao_equipamento (a unit requested by a tb_tarefa for a period
-- of whole days, independent of the tarefa's own dates).

CREATE TABLE IF NOT EXISTS `tb_equipamento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_equipamento_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tb_requisicao_equipamento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tarefa_id` bigint NOT NULL,
  `equipamento_id` bigint NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `observacoes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_requisicao_tarefa_id` (`tarefa_id`),
  KEY `idx_requisicao_equipamento_periodo` (`equipamento_id`, `data_inicio`, `data_fim`),
  CONSTRAINT `FK_requisicao_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`),
  CONSTRAINT `FK_requisicao_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `tb_equipamento` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
