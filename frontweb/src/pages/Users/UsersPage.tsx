import React, { useState, useEffect } from 'react';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { deleteUserAPI, getUserByIdAPI } from 'api/requestsApi';
import { User } from 'types/user';
import Button from 'react-bootstrap/Button';
import AddUserModal from 'components/User/AddUserModal';
import EditUserModal from 'components/User/EditUserModal';

import './styles.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = async (userId: number) => {
    try {
      const fetchedUser = await getUserByIdAPI(userId);
      if (fetchedUser) {
        setUserToEdit(fetchedUser);
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Handle error as needed
    }
  };

  const handleUserSaved = (savedUser: User) => {
    if (userToEdit) {
      setUsers(
        users.map((user) => (user.id === savedUser.id ? savedUser : user))
      );
    } else {
      setUsers([...users, savedUser]);
    }
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
      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onUserSaved={handleUserSaved}
      />
      <EditUserModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default UsersPage;
