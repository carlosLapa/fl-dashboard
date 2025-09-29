// Define all possible permissions in the system
export enum Permission {
  // Proposta permissions
  CREATE_PROPOSTA = 'CREATE_PROPOSTA',
  EDIT_PROPOSTA = 'EDIT_PROPOSTA',
  DELETE_PROPOSTA = 'DELETE_PROPOSTA',
  VIEW_ALL_PROPOSTAS = 'VIEW_ALL_PROPOSTAS',
  VIEW_ASSIGNED_PROPOSTAS = 'VIEW_ASSIGNED_PROPOSTAS',
  // Kanban permissions
  MOVE_CARD_TO_BACKLOG = 'MOVE_CARD_TO_BACKLOG',
  MOVE_CARD_TO_TODO = 'MOVE_CARD_TO_TODO',
  MOVE_CARD_TO_IN_PROGRESS = 'MOVE_CARD_TO_IN_PROGRESS',
  MOVE_CARD_TO_REVIEW = 'MOVE_CARD_TO_REVIEW',
  MOVE_CARD_TO_DONE = 'MOVE_CARD_TO_DONE',

  // Project permissions
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
  VIEW_ASSIGNED_PROJECTS = 'VIEW_ASSIGNED_PROJECTS',

  // User permissions
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',
  MANAGE_USER_ROLES = 'MANAGE_USER_ROLES',
  MANAGE_USER_PASSWORDS = 'MANAGE_USER_PASSWORDS',

  // Task permissions
  CREATE_TASK = 'CREATE_TASK',
  EDIT_TASK = 'EDIT_TASK',
  DELETE_TASK = 'DELETE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  VIEW_ALL_TASKS = 'VIEW_ALL_TASKS',
  VIEW_ASSIGNED_TASKS = 'VIEW_ASSIGNED_TASKS',
  EDIT_OWN_TASK = 'EDIT_OWN_TASK',

  // Client permissions (new)
  CREATE_CLIENT = 'CREATE_CLIENT',
  EDIT_CLIENT = 'EDIT_CLIENT',
  DELETE_CLIENT = 'DELETE_CLIENT',
  VIEW_ALL_CLIENTS = 'VIEW_ALL_CLIENTS',
  VIEW_ASSIGNED_CLIENTS = 'VIEW_ASSIGNED_CLIENTS',

  // External resource permissions (new)
  CREATE_EXTERNAL = 'CREATE_EXTERNAL',
  EDIT_EXTERNAL = 'EDIT_EXTERNAL',
  DELETE_EXTERNAL = 'DELETE_EXTERNAL',
  VIEW_ALL_EXTERNALS = 'VIEW_ALL_EXTERNALS',
  VIEW_ASSIGNED_EXTERNALS = 'VIEW_ASSIGNED_EXTERNALS',

  // System permissions (new)
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
}

// Map role types to their permissions
const rolePermissions: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admin has all permissions

  MANAGER: [
  // Proposta permissions
  Permission.CREATE_PROPOSTA,
  Permission.EDIT_PROPOSTA,
  Permission.DELETE_PROPOSTA,
  Permission.VIEW_ALL_PROPOSTAS,
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
    Permission.VIEW_REPORTS,
  ],

  EMPLOYEE: [
    // Limited Kanban permissions
    Permission.MOVE_CARD_TO_BACKLOG,
    Permission.MOVE_CARD_TO_TODO,
    Permission.MOVE_CARD_TO_IN_PROGRESS,
    // Note: Employees can't move cards to REVIEW or DONE
    
    // Limited project access
    Permission.VIEW_ASSIGNED_PROJECTS,
    
    // Task permissions (limited)
    Permission.CREATE_TASK,
    Permission.EDIT_OWN_TASK,
    Permission.VIEW_ASSIGNED_TASKS,
    
    // View permissions only
    Permission.VIEW_ASSIGNED_CLIENTS,
    Permission.VIEW_ASSIGNED_EXTERNALS,
  ],
};

export default rolePermissions;
