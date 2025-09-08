package com.fl.dashboard.enums;

public enum Permission {
    // Kanban permissions
    MOVE_CARD_TO_BACKLOG,
    MOVE_CARD_TO_TODO,
    MOVE_CARD_TO_IN_PROGRESS,
    MOVE_CARD_TO_REVIEW,
    MOVE_CARD_TO_DONE,

    // Project permissions
    CREATE_PROJECT,
    EDIT_PROJECT,
    DELETE_PROJECT,
    VIEW_ALL_PROJECTS,
    VIEW_ASSIGNED_PROJECTS,

    // User permissions
    CREATE_USER,
    EDIT_USER,
    DELETE_USER,
    VIEW_ALL_USERS,
    MANAGE_USER_ROLES,
    MANAGE_USER_PASSWORDS,

    // Task permissions
    CREATE_TASK,
    EDIT_TASK,
    DELETE_TASK,
    ASSIGN_TASK,
    VIEW_ALL_TASKS,
    VIEW_ASSIGNED_TASKS,
    EDIT_OWN_TASK,

    // Client permissions
    CREATE_CLIENT,
    EDIT_CLIENT,
    DELETE_CLIENT,
    VIEW_ALL_CLIENTS,
    VIEW_ASSIGNED_CLIENTS,

    // External resource permissions
    CREATE_EXTERNAL,
    EDIT_EXTERNAL,
    DELETE_EXTERNAL,
    VIEW_ALL_EXTERNALS,
    VIEW_ASSIGNED_EXTERNALS,

    // System permissions
    VIEW_REPORTS,
    EXPORT_DATA,
    SYSTEM_SETTINGS
}
