import React from 'react';
import { useAuth } from '../../AuthContext';
import { Button, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

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
      <Nav.Link
        as={Link}
        to={`/users/${user.id}/tarefas`}
        className="me-3 user-avatar-link"
        title="As minhas tarefas"
        aria-label="As minhas tarefas"
      >
        <UserAvatar userId={user.id} name={user.name} size={35} rounded />
      </Nav.Link>
    </div>
  );
};

export default UserInfo;
