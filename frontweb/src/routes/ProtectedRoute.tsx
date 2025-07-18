import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Spinner } from 'react-bootstrap'; // Import Spinner or use your own loading component
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../permissions/rolePermissions';

interface ProtectedRouteProps {
  element: React.ReactElement;
  permissions?: Permission | Permission[]; // Optional permissions
  type?: 'all' | 'any';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  permissions,
  type = 'any',
  redirectTo = '/unauthorized',
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/" />;
  }

  // If permissions are specified, check them
  if (permissions) {
    const hasAccess = () => {
      if (Array.isArray(permissions)) {
        return type === 'all'
          ? hasAllPermissions(permissions)
          : hasAnyPermission(permissions);
      }
      return hasPermission(permissions);
    };

    // Redirect if user doesn't have required permissions
    if (!hasAccess()) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Render the protected component
  return element;
};

export default ProtectedRoute;
