-- V11__Remove_unused_role_table.sql

-- Remove the unused 'role' table that was mistakenly used in V9
-- All role data is properly stored in 'tb_role' table
DROP TABLE IF EXISTS `role`;

-- Verify cleanup
SELECT 'Unused role table removed successfully' as status;
SHOW TABLES LIKE '%role%';