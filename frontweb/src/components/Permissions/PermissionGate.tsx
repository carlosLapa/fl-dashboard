import React from 'react';
import { Permission } from '../../permissions/rolePermissions'; // Ensure this import is correct
import { usePermissions } from '../../hooks/usePermissions';

type PermissionGateProps = {
  children: React.ReactNode;
  permissions: Permission | Permission[];
  renderNoAccess?: React.ReactNode;
  type?: 'all' | 'any'; // Whether user needs all permissions or any of them
};

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  renderNoAccess = null,
  type = 'any',
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const hasAccess = () => {
    if (Array.isArray(permissions)) {
      return type === 'all'
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
    }
    return hasPermission(permissions);
  };

  return hasAccess() ? <>{children}</> : <>{renderNoAccess}</>;
};

export default PermissionGate;
