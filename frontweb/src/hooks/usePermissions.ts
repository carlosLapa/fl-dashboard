import { useAuth } from '../AuthContext';
import rolePermissions, { Permission } from '../permissions/rolePermissions';

export function usePermissions() {
  const { user } = useAuth(); 
  
  const hasPermission = (permission: Permission): boolean => {
    console.log('=== hasPermission DEBUG ===');
    console.log('Checking permission:', permission);
    console.log('User:', user);
    console.log('User roles:', user?.roles);
    
    if (!user || !user.roles) {
      console.log('No user or roles found');
      return false;
    }

    // Check if user has any role with the required permission
    const hasAccess = user.roles.some(role => {
      // Use the correct field name from your database
      const roleType = role.role_type || role.name || role.authority;
      console.log('Checking role:', role);
      console.log('Role type extracted:', roleType);
      
      const permissions = rolePermissions[roleType] || [];
      console.log('Permissions for role type:', permissions);
      
      const hasThisPermission = permissions.includes(permission);
      console.log('Has permission:', hasThisPermission);
      
      return hasThisPermission;
    });
    
    console.log('Final result:', hasAccess);
    console.log('=== END hasPermission DEBUG ===');
    return hasAccess;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
