import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { deleteUserAPI, getUserByIdAPI } from 'api/requestsApi';
import { User } from 'types/user';
import Button from 'react-bootstrap/Button';
import AddUserModal from 'components/User/AddUserModal';
import EditUserModal from 'components/User/EditUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { usePermissions } from 'hooks/usePermissions';
import './userStyles.scss';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isEmployee } = usePermissions();
  
  // Check if user is an employee (not admin or manager)
  const shouldDisableActions = isEmployee();
  
  // Define disabled style - same as in UserTable
  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers(page, pageSize);
      console.log('Users response:', response);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddUser = () => {
    if (shouldDisableActions) return;
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
    <div className="page-container" style={{ marginTop: '2rem' }}>
      {/* Wrap the title container and table in a div with consistent width and margins */}
      <div
        style={{
          width: '98%',
          marginLeft: '2%',
          marginRight: '2%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <h2 className="page-title">Colaboradores</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleAddUser}
              className="create-button"
              style={shouldDisableActions ? disabledStyle : {}}
              disabled={shouldDisableActions}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Utilizador
            </Button>
          </div>
        </div>
        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <UserTable
            users={users}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewTasks={handleViewTasks}
            page={page}
            onPageChange={setPage}
            totalPages={totalPages}
            isLoading={isLoading}
          />
        </div>
      </div>
      {/* Modals */}
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
