import React from 'react';
import { useAuth } from '../../AuthContext';
import { Button } from 'react-bootstrap';

import './userInfo.css';

const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="user-info">
      <span className="user-welcome">Bem vindo, {user.name}</span>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={logout}
        className="logout-button"
      >
        Logout
      </Button>
    </div>
  );
};

export default UserInfo;
