import React, { useState, useEffect } from 'react';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { User } from 'types/user';
import Button from 'react-bootstrap/Button';
import UserModal from 'components/User/UserModal';
import { deleteUserAPI } from 'api/requestsApi';

import './styles.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  const handleUserSaved = (savedUser: User) => {
    if (isEditing) {
      setUsers(
        users.map((user) => (user.id === savedUser.id ? savedUser : user))
      );
    } else {
      setUsers([...users, savedUser]);
    }
  };

  const handleAddUser = () => {
    setUserToEdit(null);
    setShowModal(true);
    setIsEditing(false);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setShowModal(true);
    setIsEditing(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserAPI(userId);
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Colaboradores</h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="primary"
          onClick={handleAddUser}
          className="add-user-btn"
        >
          Adicionar Utilizador
        </Button>
      </div>
      <UserTable
        users={users}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
      <UserModal
        show={showModal}
        onHide={() => setShowModal(false)}
        user={userToEdit}
        onUserSaved={handleUserSaved}
        isEditing={isEditing}
      />
    </div>
  );
};

export default UsersPage;
