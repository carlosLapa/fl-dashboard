import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const response = await getUsers(page, pageSize);
    console.log('Users response:', response);
    setUsers(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

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
    }
  };

  const handleUserSaved = async (savedUser: User) => {
    if (userToEdit) {
      setUsers(
        users.map((user) => (user.id === savedUser.id ? savedUser : user))
      );
    } else {
      setUsers([...users, savedUser]);
    }
    await fetchUsers(); // Refresh the paginated data
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserAPI(userId);
      await fetchUsers(); // Refresh the paginated data
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleViewTasks = (userId: number) => {
    navigate(`/users/${userId}/tarefas`);
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
        onViewTasks={handleViewTasks}
        page={page}
        onPageChange={setPage}
        totalPages={totalPages}
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
