-- Setup roles and fix user roles

-- Step 1: Create the standard roles in the correct table (tb_role) - use INSERT IGNORE for existing data
INSERT IGNORE INTO `tb_role` (`id`, `authority`, `role_type`, `name`) VALUES
(1, 'ROLE_ADMIN', 'ADMIN', 'ADMIN'),
(2, 'ROLE_MANAGER', 'MANAGER', 'MANAGER'),
(3, 'ROLE_EMPLOYEE', 'EMPLOYEE', 'EMPLOYEE');

-- Step 2: Add indexes for better performance
CREATE INDEX `idx_user_role_user_id` ON `tb_user_role` (`user_id`);
CREATE INDEX `idx_user_role_role_id` ON `tb_user_role` (`role_id`);
CREATE INDEX `idx_tb_role_authority` ON `tb_role` (`authority`);

-- Step 3: Create a view to easily see user roles
CREATE VIEW `v_user_roles` AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    r.id as role_id,
    r.authority,
    r.role_type,
    r.name as role_name
FROM `tb_user` u
JOIN `tb_user_role` ur ON u.id = ur.user_id
JOIN `tb_role` r ON ur.role_id = r.id
ORDER BY u.name, r.role_type;

-- Step 4: Verify the setup
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_roles FROM `tb_role`;