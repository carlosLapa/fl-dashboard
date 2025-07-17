package com.fl.dashboard.config;

import com.fl.dashboard.enums.Permission;
import com.fl.dashboard.enums.RoleType;

import java.util.*;

public class PermissionMapper {
    private static final Map<RoleType, Set<Permission>> ROLE_PERMISSIONS = new HashMap<>();

    static {
        // Admin has all permissions
        Set<Permission> adminPermissions = new HashSet<>(Arrays.asList(Permission.values()));
        ROLE_PERMISSIONS.put(RoleType.ADMIN, adminPermissions);

        // Manager permissions
        Set<Permission> managerPermissions = new HashSet<>(Arrays.asList(
                // Kanban permissions
                Permission.MOVE_CARD_TO_BACKLOG,
                Permission.MOVE_CARD_TO_TODO,
                Permission.MOVE_CARD_TO_IN_PROGRESS,
                Permission.MOVE_CARD_TO_REVIEW,
                Permission.MOVE_CARD_TO_DONE,

                // Project permissions
                Permission.CREATE_PROJECT,
                Permission.EDIT_PROJECT,
                Permission.VIEW_ALL_PROJECTS,

                // Task permissions
                Permission.CREATE_TASK,
                Permission.EDIT_TASK,
                Permission.DELETE_TASK,
                Permission.ASSIGN_TASK,
                Permission.VIEW_ALL_TASKS,

                // Limited user management
                Permission.EDIT_USER,
                Permission.VIEW_ALL_USERS,

                // Client permissions
                Permission.CREATE_CLIENT,
                Permission.EDIT_CLIENT,
                Permission.VIEW_ALL_CLIENTS,

                // External resource permissions
                Permission.CREATE_EXTERNAL,
                Permission.EDIT_EXTERNAL,
                Permission.VIEW_ALL_EXTERNALS,

                // Reports
                Permission.VIEW_REPORTS
        ));
        ROLE_PERMISSIONS.put(RoleType.MANAGER, managerPermissions);

        // Employee permissions
        Set<Permission> employeePermissions = new HashSet<>(Arrays.asList(
                // Limited Kanban permissions
                Permission.MOVE_CARD_TO_BACKLOG,
                Permission.MOVE_CARD_TO_TODO,
                Permission.MOVE_CARD_TO_IN_PROGRESS,

                // Limited project access
                Permission.VIEW_ASSIGNED_PROJECTS,

                // Task permissions (limited)
                Permission.CREATE_TASK,
                Permission.EDIT_OWN_TASK,
                Permission.VIEW_ASSIGNED_TASKS,

                // View permissions only
                Permission.VIEW_ASSIGNED_CLIENTS,
                Permission.VIEW_ASSIGNED_EXTERNALS
        ));
        ROLE_PERMISSIONS.put(RoleType.EMPLOYEE, employeePermissions);
    }

    public static Set<Permission> getPermissionsForRole(RoleType roleType) {
        return ROLE_PERMISSIONS.getOrDefault(roleType, Collections.emptySet());
    }

    public static Set<String> getPermissionNamesForRole(RoleType roleType) {
        Set<String> permissionNames = new HashSet<>();
        Set<Permission> permissions = getPermissionsForRole(roleType);

        for (Permission permission : permissions) {
            permissionNames.add(permission.name());
        }

        return permissionNames;
    }
}
