import React from 'react';
import { Permission } from '../../permissions/rolePermissions';
import PermissionGate from './PermissionGate';

interface ProtectedButtonProps {
  permissions: Permission | Permission[];
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: 'all' | 'any';
}

const ProtectedButton: React.FC<ProtectedButtonProps> = ({
  permissions,
  children,
  onClick,
  className,
  disabled = false,
  style = {},
  type = 'any',
}) => {
  return (
    <PermissionGate
      permissions={permissions}
      type={type}
      renderNoAccess={
        <button
          className={className}
          disabled={true}
          style={{
            opacity: 0.3,
            cursor: 'not-allowed',
            ...style,
          }}
        >
          {children}
        </button>
      }
    >
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        style={style}
      >
        {children}
      </button>
    </PermissionGate>
  );
};

export default ProtectedButton;
