// Define all possible permissions in the system
export enum Permission {
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

  // User permissions
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',

  // Task permissions
  CREATE_TASK = 'CREATE_TASK',
  EDIT_TASK = 'EDIT_TASK',
  DELETE_TASK = 'DELETE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
}

// Map role types to their permissions
const rolePermissions: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admin has all permissions

  MANAGER: [
    Permission.MOVE_CARD_TO_BACKLOG,
    Permission.MOVE_CARD_TO_TODO,
    Permission.MOVE_CARD_TO_IN_PROGRESS,
    Permission.MOVE_CARD_TO_REVIEW,
    Permission.MOVE_CARD_TO_DONE,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
    Permission.DELETE_TASK,
    Permission.ASSIGN_TASK,
  ],

  EMPLOYEE: [
    Permission.MOVE_CARD_TO_BACKLOG,
    Permission.MOVE_CARD_TO_TODO,
    Permission.MOVE_CARD_TO_IN_PROGRESS,
    // Note: Employees can't move cards to REVIEW or DONE
    Permission.CREATE_TASK,
    Permission.EDIT_TASK,
  ],
};

export default rolePermissions;
