import React from 'react';
import { useAuth } from '../../AuthContext';
import { Button } from 'react-bootstrap';

const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="user-info">
      <span>Welcome, {user.name}</span>
      <Button variant="outline-secondary" size="sm" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};

export default UserInfo;
