-- V9__Setup_roles_and_fix_user_roles.sql

-- Step 1: Ensure the standard roles exist in tb_role with the correct IDs
-- Insert roles with specific IDs to match your existing user_role associations
INSERT IGNORE INTO `tb_role` (`id`, `authority`, `role_type`) VALUES
(1, 'ROLE_ADMIN', 'ADMIN'),
(2, 'ROLE_MANAGER', 'MANAGER'),
(3, 'ROLE_EMPLOYEE', 'EMPLOYEE');

-- Step 2: Verify data integrity - check if all user_role associations are valid
-- This should return 0 rows if everything is correct
SELECT ur.user_id, ur.role_id, 'ORPHANED_ASSOCIATION' as issue
FROM `tb_user_role` ur
LEFT JOIN `tb_role` r ON ur.role_id = r.id
WHERE r.id IS NULL;

-- Step 3: Verify all users exist in user table
-- This should return 0 rows if everything is correct
SELECT ur.user_id, ur.role_id, 'USER_NOT_EXISTS' as issue
FROM `tb_user_role` ur
LEFT JOIN `tb_user` u ON ur.user_id = u.id
WHERE u.id IS NULL;

-- Step 4: Add indexes for better performance on role queries
CREATE INDEX IF NOT EXISTS `idx_user_role_user_id` ON `tb_user_role` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_user_role_role_id` ON `tb_user_role` (`role_id`);
CREATE INDEX IF NOT EXISTS `idx_role_authority` ON `tb_role` (`authority`);

-- Step 5: Create a view to easily see user roles (optional, for debugging)
CREATE OR REPLACE VIEW `v_user_roles` AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    r.id as role_id,
    r.authority,
    r.role_type
FROM `tb_user` u
JOIN `tb_user_role` ur ON u.id = ur.user_id
JOIN `tb_role` r ON ur.role_id = r.id
ORDER BY u.name, r.role_type;