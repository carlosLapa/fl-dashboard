import React from 'react';
import { useAuth } from '../../AuthContext';
import { Button, Nav } from 'react-bootstrap';
import defaultAvatarImage from '../../assets/images/user-avatar-test.png';

import './userInfo.css';

const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="user-info">
      <span className="user-welcome">Bem vindo/a, {user.name}</span>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={logout}
        className="logout-button"
      >
        Logout
      </Button>
      <Nav.Link className="me-3">
        <div
          className="rounded-circle overflow-hidden"
          style={{ width: '35px', height: '35px' }}
        >
          <img
            src={user.profileImage || defaultAvatarImage}
            alt="User Avatar"
            className="w-100 h-100"
          />
        </div>
      </Nav.Link>
    </div>
  );
};

export default UserInfo;
