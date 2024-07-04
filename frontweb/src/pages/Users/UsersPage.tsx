import React, { useState, useEffect } from 'react';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { User } from 'types/user';
import Button from 'react-bootstrap/Button';
import AddUserModal from 'components/User/AddUserModal';

import './styles.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Colaboradores</h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="add-user-btn"
        >
          Adicionar Utilizador
        </Button>
      </div>
      <UserTable users={users} />
      <AddUserModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};

export default UsersPage;
