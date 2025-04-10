-- V1__Initial_Schema.sql
-- Initial database schema for fldashboard

-- Table structure for table `tb_role`
CREATE TABLE IF NOT EXISTS `tb_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `authority` varchar(255) DEFAULT NULL,
  `role_type` enum('ADMIN','EMPLOYEE','MANAGER') DEFAULT NULL,
  `name` enum('ADMIN','MANAGER','EMPLOYEE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_1ncmoedv5ta7r19y9d4oidn0y` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_user`
CREATE TABLE IF NOT EXISTS `tb_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` mediumblob,
  `cargo` varchar(255) DEFAULT NULL,
  `funcao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_4vih17mube9j7cqyjlfbcrk4m` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_user_role`
CREATE TABLE IF NOT EXISTS `tb_user_role` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKea2ootw6b6bb0xt3ptl28bymv` (`role_id`),
  CONSTRAINT `FK7vn3h53d0tqdimm8cp45gc0kl` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`),
  CONSTRAINT `FKea2ootw6b6bb0xt3ptl28bymv` FOREIGN KEY (`role_id`) REFERENCES `tb_role` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_departamento`
CREATE TABLE IF NOT EXISTS `tb_departamento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) DEFAULT NULL,
  `designacao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_especialidade`
CREATE TABLE IF NOT EXISTS `tb_especialidade` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_projeto`
CREATE TABLE IF NOT EXISTS `tb_projeto` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `designacao` varchar(255) DEFAULT NULL,
  `entidade` varchar(255) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `prazo` datetime(6) DEFAULT NULL,
  `prioridade` varchar(255) DEFAULT NULL,
  `projeto_ano` int DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_projeto_user`
CREATE TABLE IF NOT EXISTS `tb_projeto_user` (
  `projeto_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`projeto_id`,`user_id`),
  KEY `FKgtkfghqt5giuft4tc0uuansq0` (`user_id`),
  CONSTRAINT `FKb50j0jyd7jdmqcjlkewjuk21l` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FKgtkfghqt5giuft4tc0uuansq0` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_coluna`
CREATE TABLE IF NOT EXISTS `tb_coluna` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ordem` int DEFAULT NULL,
  `status` enum('BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE') DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `projeto_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkwsya8hdoggrikbcrfjrtguv2` (`projeto_id`),
  CONSTRAINT `FKkwsya8hdoggrikbcrfjrtguv2` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_tarefa`
CREATE TABLE IF NOT EXISTS `tb_tarefa` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) DEFAULT NULL,
  `prazo_estimado` datetime(6) DEFAULT NULL,
  `prazo_real` datetime(6) DEFAULT NULL,
  `prioridade` varchar(255) DEFAULT NULL,
  `projeto_id` bigint DEFAULT NULL,
  `status` enum('BACKLOG','TODO','IN_PROGRESS','IN_REVIEW','DONE') DEFAULT NULL,
  `coluna_id` bigint DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKaqscdhy9e2qs5a3tfjqyyo6dc` (`projeto_id`),
  KEY `FKmh6vo2utmkogtrxhrke4nu5qy` (`coluna_id`),
  CONSTRAINT `FKaqscdhy9e2qs5a3tfjqyyo6dc` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FKmh6vo2utmkogtrxhrke4nu5qy` FOREIGN KEY (`coluna_id`) REFERENCES `tb_coluna` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_tarefa_user`
CREATE TABLE IF NOT EXISTS `tb_tarefa_user` (
  `tarefa_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`tarefa_id`,`user_id`),
  KEY `FKoy29mg7m8mpejd7p2ruc8bqla` (`user_id`),
  CONSTRAINT `FKonqg7oeg1x3hersy1j0hij474` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`),
  CONSTRAINT `FKoy29mg7m8mpejd7p2ruc8bqla` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `tb_notification`
CREATE TABLE IF NOT EXISTS `tb_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_read` bit(1) DEFAULT NULL,
  `related_id` bigint DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `projeto_id` bigint DEFAULT NULL,
  `tarefa_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_notification_user` (`user_id`),
  KEY `fk_notification_tarefa` (`tarefa_id`),
  KEY `fk_notification_projeto` (`projeto_id`),
  CONSTRAINT `FK5aiph3y986geu6rgfggmi86yw` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `FK9ihj3k9lv33u6qd10wq18f482` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`),
  CONSTRAINT `fk_notification_projeto` FOREIGN KEY (`projeto_id`) REFERENCES `tb_projeto` (`id`),
  CONSTRAINT `fk_notification_tarefa` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`),
  CONSTRAINT `FKfg24uh28g03ugmm9ur7qusgbb` FOREIGN KEY (`tarefa_id`) REFERENCES `tb_tarefa` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;