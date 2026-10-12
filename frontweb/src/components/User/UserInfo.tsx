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
      <Link
        to={`/users/${user.id}/tarefas`}
        className="user-welcome"
        title="As minhas tarefas"
      >
        Bem vindo/a, {user.name}
      </Link>
      <Nav.Link
        as={Link}
        to={`/users/${user.id}/tarefas`}
        className="user-avatar-link"
        title="As minhas tarefas"
        aria-label="As minhas tarefas"
      >
        <UserAvatar userId={user.id} name={user.name} size={35} rounded />
      </Nav.Link>
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={logout}
        className="logout-button me-3"
      >
        Logout
      </Button>
    </div>
  );
};

export default UserInfo;
