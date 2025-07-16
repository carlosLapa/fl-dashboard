import { useAuth } from '../AuthContext';
import rolePermissions, { Permission } from '../permissions/rolePermissions';

type RoleType = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export function usePermissions() {
  const { user } = useAuth(); 
  
  const hasPermission = (permission: Permission, userId?: number): boolean => {
    console.log('=== hasPermission DEBUG ===');
    console.log('Checking permission:', permission);
    console.log('User:', user);
    console.log('User roles:', user?.roles);
    console.log('Target userId:', userId);

    if (!user || !user.roles || user.roles.length === 0) {
      console.log('No user or roles found');
      return false;
    }

    // Check user-specific permissions (like editing own tasks)
    if (userId && user.id === userId) {
      if (permission === Permission.EDIT_OWN_TASK) {
        const canEditOwn = user.roles.some(role => {
          const roleType = role.role_type as RoleType;
          const permissions = rolePermissions[roleType] || [];
          return permissions.includes(Permission.EDIT_OWN_TASK);
        });
        console.log('Can edit own task:', canEditOwn);
        return canEditOwn;
      }
    }

    // Check general permissions
    const hasGeneralPermission = user.roles.some(role => {
      console.log('Checking role:', role);
      const roleType = role.role_type as RoleType;
      console.log('Role type extracted:', roleType);
      
      const permissions = rolePermissions[roleType] || [];
      console.log('Permissions for role type:', permissions);
      
      const hasPermission = permissions.includes(permission);
      console.log('Has permission:', hasPermission);
      
      return hasPermission;
    });

    console.log('Final result:', hasGeneralPermission);
    console.log('=== END hasPermission DEBUG ===');
    
    return hasGeneralPermission;
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
