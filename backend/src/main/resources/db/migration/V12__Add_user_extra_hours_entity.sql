-- V12__Add_user_extra_hours_entity.sql

-- Create the tb_user_extra_hours table
CREATE TABLE IF NOT EXISTS `tb_user_extra_hours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `date` date NOT NULL,
  `hours` double NOT NULL, -- positive for extra, negative for less
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_extra_hours_user_id` (`user_id`),
  KEY `idx_user_extra_hours_date` (`date`),
  CONSTRAINT `FK_user_extra_hours_user`
    FOREIGN KEY (`user_id`) REFERENCES `tb_user` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional: Add a unique constraint to prevent duplicate entries for the same user and date
ALTER TABLE `tb_user_extra_hours`
ADD CONSTRAINT `UK_user_date` UNIQUE (`user_id`, `date`);