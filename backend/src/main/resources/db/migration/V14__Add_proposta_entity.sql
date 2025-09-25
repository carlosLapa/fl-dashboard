-- V14__add_proposta_entity.sql
-- Create the tb_proposta table


CREATE TABLE IF NOT EXISTS `tb_proposta` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `proposta_ano` int DEFAULT NULL,
  `designacao` varchar(255) NOT NULL,
  `prioridade` varchar(255) DEFAULT NULL,
  `observacao` TEXT DEFAULT NULL,
  `prazo` timestamp NULL DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `data_proposta` timestamp NULL DEFAULT NULL,
  `data_adjudicacao` timestamp NULL DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create junction table for Proposta-Cliente relationship
CREATE TABLE IF NOT EXISTS `tb_proposta_cliente` (
  `proposta_id` bigint NOT NULL,
  `cliente_id` bigint NOT NULL,
  PRIMARY KEY (`proposta_id`,`cliente_id`),
  KEY `FK_proposta_cliente_cliente` (`cliente_id`),
  CONSTRAINT `FK_proposta_cliente_proposta` FOREIGN KEY (`proposta_id`) REFERENCES `tb_proposta` (`id`),
  CONSTRAINT `FK_proposta_cliente_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `tb_cliente` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;