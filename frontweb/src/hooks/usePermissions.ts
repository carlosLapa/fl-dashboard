import { useAuth } from '../AuthContext';
import rolePermissions, { Permission } from '../permissions/rolePermissions';

type RoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export function usePermissions() {
  const { user } = useAuth(); 
  
  const hasPermission = (permission: Permission, userId?: number): boolean => {
    if (!user || !user.roles || user.roles.length === 0) {
      return false;
    }

    // Check user-specific permissions (like editing own tasks)
    if (userId && user.id === userId) {
      if (permission === Permission.EDIT_OWN_TASK) {
        return user.roles.some(role => {
          const roleType = role.role_type as RoleType;
          const permissions = rolePermissions[roleType] || [];
          return permissions.includes(Permission.EDIT_OWN_TASK);
        });
      }
    }

    // Check general permissions
    return user.roles.some(role => {
      const roleType = role.role_type as RoleType;
      const permissions = rolePermissions[roleType] || [];
      return permissions.includes(permission);
    });
  };

  // New methods for your PermissionGate
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserRole = (): RoleType | null => {
    if (!user?.roles || user.roles.length === 0) return null;
    return user.roles[0].role_type as RoleType;
  };

  const isAdmin = () => getUserRole() === 'ADMIN';
  const isManager = () => getUserRole() === 'MANAGER';
  const isEmployee = () => getUserRole() === 'EMPLOYEE';

  return {
    hasPermission,
    hasAnyPermission,      // New method for PermissionGate
    hasAllPermissions,     // New method for PermissionGate
    getUserRole,
    isAdmin,
    isManager,
    isEmployee
  };
}
