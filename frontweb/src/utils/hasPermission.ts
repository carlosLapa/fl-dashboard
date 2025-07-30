/**
 * Check if the current user has a specific permission
 * @param permission The permission to check for
 * @returns True if the user has the permission, false otherwise
 */
export const hasPermission = (permission: string): boolean => {
  try {
    // Get the current user from localStorage or your auth context
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return false;

    const userData = JSON.parse(userDataStr);
    if (!userData || !userData.roles) return false;

    // Check if any of the user's roles/authorities includes the requested permission
    return userData.roles.some(
      (role: any) => role.authority === permission || role === permission
    );
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

/**
 * Check if the current user has any of the specified permissions
 * @param permissions Array of permissions to check
 * @returns True if the user has any of the permissions, false otherwise
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
  return permissions.some((permission) => hasPermission(permission));
};

/**
 * Check if the current user can view all projects
 * @returns True if the user can view all projects, false if they can only view assigned projects
 */
export const canViewAllProjects = (): boolean => {
  return hasPermission('VIEW_ALL_PROJECTS');
};

/**
 * Check if the current user can create projects
 * @returns True if the user can create projects
 */
export const canCreateProject = (): boolean => {
  return hasPermission('CREATE_PROJECT') || hasPermission('ROLE_ADMIN');
};

/**
 * Check if the current user can edit projects
 * @returns True if the user can edit projects
 */
export const canEditProject = (): boolean => {
  return hasPermission('EDIT_PROJECT');
};

/**
 * Check if the current user can delete projects
 * @returns True if the user can delete projects
 */
export const canDeleteProject = (): boolean => {
  return hasPermission('DELETE_PROJECT');
};

/**
 * Check if the current user can view project details
 * @returns True if the user can view project details
 */
export const canViewProjectDetails = (): boolean => {
  return (
    hasPermission('VIEW_PROJECT_DETAILS') ||
    hasPermission('ROLE_ADMIN') ||
    hasPermission('EDIT_PROJECT') ||
    hasPermission('CREATE_PROJECT')
  );
};

/**
 * Check if the current user can view all users
 * @returns True if the user can view all users
 */
export const canViewAllUsers = (): boolean => {
  return hasPermission('VIEW_ALL_USERS') || hasPermission('ROLE_ADMIN');
};

/**
 * Check if the current user can create users
 * @returns True if the user can create users
 */
export const canCreateUser = (): boolean => {
  return hasPermission('CREATE_USER') || hasPermission('ROLE_ADMIN');
};

/**
 * Check if the current user can edit users
 * @returns True if the user can edit users
 */
export const canEditUser = (): boolean => {
  return hasPermission('EDIT_USER') || hasPermission('ROLE_ADMIN');
};

/**
 * Check if the current user can delete users
 * @returns True if the user can delete users
 */
export const canDeleteUser = (): boolean => {
  return hasPermission('DELETE_USER') || hasPermission('ROLE_ADMIN');
};

/**
 * Check if the current user can manage users (combination of create, edit, delete)
 * @returns True if the user can manage users
 */
export const canManageUsers = (): boolean => {
  return (
    hasPermission('MANAGE_USERS') ||
    hasPermission('ROLE_ADMIN') ||
    (hasPermission('CREATE_USER') &&
      hasPermission('EDIT_USER') &&
      hasPermission('DELETE_USER'))
  );
};

/**
 * Check if user has permission to move cards to review column
 * @returns True if the user can move cards to review
 */
export const canMoveCardToReview = (): boolean => {
  return (
    hasPermission('MOVE_CARD_TO_REVIEW') ||
    hasPermission('ROLE_ADMIN') ||
    hasPermission('EDIT_PROJECT')
  );
};

/**
 * Check if user has permission to move cards to done column
 * @returns True if the user can move cards to done
 */
export const canMoveCardToDone = (): boolean => {
  return (
    hasPermission('MOVE_CARD_TO_DONE') ||
    hasPermission('ROLE_ADMIN') ||
    hasPermission('EDIT_PROJECT')
  );
};
