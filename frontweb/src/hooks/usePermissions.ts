import { useAuth } from '../AuthContext'; // Import the useAuth hook instead of AuthContext
import rolePermissions, { Permission } from '../permissions/rolePermissions';

export function usePermissions() {
  const { user } = useAuth(); // Use the useAuth hook to access user data

  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.roles) {
      return false;
    }

    // Check if user has any role with the required permission
    return user.roles.some((role) => {
      const roleType = role.role_type;
      const permissions = rolePermissions[roleType] || [];
      return permissions.includes(permission);
    });
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  // Helper to get the highest role a user has
  const getHighestRole = (): string | null => {
    if (!user?.roles || user.roles.length === 0) {
      return null;
    }

    const roleHierarchy = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    const userRoleTypes = user.roles.map((role) => role.role_type);

    // Find the highest role in the hierarchy
    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      if (userRoleTypes.includes(roleHierarchy[i])) {
        return roleHierarchy[i];
      }
    }

    return userRoleTypes[0]; // Fallback to first role
  };

  return { hasPermission, hasAnyPermission, hasAllPermissions, getHighestRole };
}
