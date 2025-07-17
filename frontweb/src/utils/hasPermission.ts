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
