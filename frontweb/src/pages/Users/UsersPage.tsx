import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import UserTable from 'components/User/UserTable';
import { getUsers, deactivateUser, reactivateUser } from 'services/userService';
import { getUserByIdAPI } from 'api/requestsApi';
import { getUnreadCountsAPI } from 'api/notificationsApi';
import { User } from 'types/user';
import Button from 'react-bootstrap/Button';
import AddUserModal from 'components/User/AddUserModal';
import EditUserModal from 'components/User/EditUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faKey } from '@fortawesome/free-solid-svg-icons';
import { usePermissions } from 'hooks/usePermissions';
import { useAuth } from 'AuthContext';
import { Permission } from 'permissions/rolePermissions';
import './userStyles.scss';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isEmployee, isAdmin, isManager, hasPermission } = usePermissions();
  const { user: currentUser } = useAuth();

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
      setUsers(response.content);
      setTotalPages(response.totalPages);

      // Fetch unread notification counts for the whole page in a single batched request,
      // instead of each row's NotificationBadge fetching its own count independently.
      const visibleUserIds =
        isAdmin() || isManager()
          ? response.content.map((u: User) => u.id)
          : currentUser
            ? [currentUser.id]
            : [];
      if (visibleUserIds.length > 0) {
        const counts = await getUnreadCountsAPI(visibleUserIds);
        setUnreadCounts(counts);
      } else {
        setUnreadCounts({});
      }
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

  const handleNavigateToPasswordReset = () => {
    navigate('/admin/password-reset');
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

  const handleDeactivateUser = async (userId: number) => {
    try {
      await deactivateUser(userId);
      toast.success('Colaborador desativado com sucesso!');
      await fetchUsers();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Não foi possível desativar o colaborador.';
      toast.error(message);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    try {
      await reactivateUser(userId);
      toast.success('Colaborador reativado com sucesso!');
      await fetchUsers();
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Não foi possível reativar o colaborador.';
      toast.error(message);
    }
  };

  const handleViewTasks = (userId: number) => {
    navigate(`/users/${userId}/tarefas`);
  };

  // Adicione esta função para lidar com o redirecionamento para reset de senha
  const handleResetPassword = (userId: number) => {
    navigate(`/admin/password-reset?userId=${userId}`);
  };

  return (
    <div className="page-container">
      <div className="page-shell">
        <div className="page-title-container page-title-container--scroll-table">
          <h2 className="page-title page-title--user-header">Colaboradores</h2>
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

            {/* Novo botão para Gerenciar Senhas - apenas visível para usuários com permissão */}
            {hasPermission(Permission.MANAGE_USER_PASSWORDS) && (
              <Button
                variant="secondary"
                onClick={handleNavigateToPasswordReset}
                className="create-button ms-2"
              >
                <FontAwesomeIcon icon={faKey} className="me-2" />
                Gerir Senhas
              </Button>
            )}
          </div>
        </div>

        {/* Table wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <UserTable
            users={users}
            unreadCounts={unreadCounts}
            onEditUser={handleEditUser}
            onDeactivateUser={handleDeactivateUser}
            onReactivateUser={handleReactivateUser}
            onViewTasks={handleViewTasks}
            onResetPassword={
              hasPermission(Permission.MANAGE_USER_PASSWORDS)
                ? handleResetPassword
                : undefined
            }
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
