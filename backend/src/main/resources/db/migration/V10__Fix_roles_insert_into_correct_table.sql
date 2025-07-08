-- V10__Fix_roles_insert_into_correct_table.sql

-- Step 1: Update existing roles to have correct authority format and name values
UPDATE `tb_role` SET
    authority = 'ROLE_ADMIN',
    name = 'ADMIN'
WHERE id = 1;

UPDATE `tb_role` SET
    authority = 'ROLE_MANAGER',
    name = 'MANAGER'
WHERE id = 2;

UPDATE `tb_role` SET
    authority = 'ROLE_EMPLOYEE',
    name = 'EMPLOYEE'
WHERE id = 3;

-- Step 2: Clean up incorrect data from wrong table
DELETE FROM `role` WHERE id IN (1, 2, 3);

-- Step 3: Add missing index to correct table
CREATE INDEX `idx_tb_role_authority` ON `tb_role` (`authority`);

-- Step 4: Create/update the view to use correct table
DROP VIEW IF EXISTS `v_user_roles`;
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

-- Step 5: Verify the corrected data
SELECT 'Roles updated successfully in tb_role table' as status;
SELECT COUNT(*) as tb_role_count FROM `tb_role`;
SELECT id, authority, role_type, name FROM `tb_role` ORDER BY id;