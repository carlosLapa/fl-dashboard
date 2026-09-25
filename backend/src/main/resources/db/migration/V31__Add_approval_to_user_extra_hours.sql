-- V31__Add_approval_to_user_extra_hours.sql
--
-- Banco de Horas approval workflow: an ADMIN's own writes are auto-approved,
-- everyone else's land as PENDING until an ADMIN approves or rejects them.

ALTER TABLE `tb_user_extra_hours`
  ADD COLUMN `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `reviewed_by` bigint DEFAULT NULL,
  ADD COLUMN `reviewed_at` datetime DEFAULT NULL,
  ADD COLUMN `rejection_reason` varchar(255) DEFAULT NULL;

-- Every row that predates this migration was written before the approval
-- workflow existed; treat that whole history as already approved rather than
-- suddenly flagging it all as pending review.
UPDATE `tb_user_extra_hours` SET `status` = 'APPROVED';

ALTER TABLE `tb_user_extra_hours`
  ADD CONSTRAINT `FK_user_extra_hours_reviewed_by`
    FOREIGN KEY (`reviewed_by`) REFERENCES `tb_user` (`id`)
    ON DELETE SET NULL,
  ADD KEY `idx_user_extra_hours_status` (`status`);
