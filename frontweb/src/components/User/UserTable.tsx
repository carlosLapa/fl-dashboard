import React from 'react';
import Table from 'react-bootstrap/Table';
import { Pagination, Spinner } from 'react-bootstrap';
import { User } from '../../types/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faTasks,
  faBell,
  faClock,
  faKey, // Adicione este ícone
} from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useNotification } from 'NotificationContext';
import NotificationBadge from './../NotificationBox/NotificationBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from 'AuthContext';
import Modal from 'react-bootstrap/Modal';
import UserExtraHoursCalendar from 'components/UserExtraHours/UserExtraHoursCalendar';
import { Permission } from '../../permissions/rolePermissions';

import './styles.scss';

interface UserTableProps {
  users: User[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onViewTasks: (userId: number) => void;
  onResetPassword?: (userId: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isLoading?: boolean;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onViewTasks,
  onResetPassword,
  page,
  onPageChange,
  totalPages,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { loadStoredNotifications } = useNotification();
  const { user } = useAuth();
  const { isEmployee, hasPermission } = usePermissions();
  const canResetPassword = hasPermission(Permission.MANAGE_USER_PASSWORDS);

  const [showExtraHours, setShowExtraHours] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null
  );

  const handleShowExtraHours = (userId: number) => {
    setSelectedUserId(userId);
    setShowExtraHours(true);
  };

  const handleCloseExtraHours = () => {
    setShowExtraHours(false);
    setSelectedUserId(null);
  };

  const handleNavigateToNotifications = async (userId: number) => {
    await loadStoredNotifications(userId);
    navigate(`/notifications/${userId}`);
  };

  // Common style for disabled icons
  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  // Show spinner when loading
  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando colaboradores...</span>
        </Spinner>
        <p className="mt-2">Carregando colaboradores...</p>
      </div>
    );
  }

  return (
    <div className="user-table-container">
      <div className="table-responsive">
        <Table striped bordered hover className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th className="d-none d-md-table-cell">Função</th>
              <th className="d-none d-md-table-cell">Cargo</th>
              <th className="d-none d-lg-table-cell">Email</th>
              <th className="d-none d-lg-table-cell">Imagem de perfil</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((rowUser) => {
                console.log('Row user:', rowUser.name, rowUser.roles);
                const isOwnRow = user?.id === rowUser.id;
                const isCurrentUserManager = user?.roles?.some(
                  (role: any) =>
                    role.authority === 'ROLE_MANAGER' || role === 'ROLE_MANAGER'
                );
                const isRowUserAdmin = rowUser.roles?.some(
                  (role: any) =>
                    role.authority === 'ROLE_ADMIN' || role === 'ROLE_ADMIN'
                );
                // Disable if Employee (not self) OR Manager viewing Admin
                const shouldDisable =
                  (isEmployee() && !isOwnRow) ||
                  (isCurrentUserManager && isRowUserAdmin);

                return (
                  <tr key={rowUser.id}>
                    <td>{rowUser.name}</td>
                    <td className="d-none d-md-table-cell">{rowUser.funcao}</td>
                    <td className="d-none d-md-table-cell">{rowUser.cargo}</td>
                    <td className="d-none d-lg-table-cell">{rowUser.email}</td>
                    <td className="d-none d-lg-table-cell">
                      {rowUser.profileImage ? (
                        <div className="profile-image-cell">
                          <img
                            src={`data:image/jpeg;base64,${rowUser.profileImage}`}
                            alt={`${rowUser.name}`}
                            className="profile-image"
                            style={{
                              maxWidth: '90px',
                              maxHeight: '90px',
                              marginLeft: '25%',
                            }}
                          />
                        </div>
                      ) : (
                        <span>Sem imagem</span>
                      )}
                    </td>
                    <td>
                      <div className="action-icons">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`edit-tooltip-${rowUser.id}`}>
                              Editar
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faPencilAlt}
                            onClick={() =>
                              !shouldDisable && onEditUser(rowUser.id)
                            }
                            className="action-icon edit-icon"
                            style={{
                              marginRight: '8px',
                              ...(shouldDisable ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`delete-tooltip-${rowUser.id}`}>
                              Eliminar
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={() =>
                              !shouldDisable && onDeleteUser(rowUser.id)
                            }
                            className="action-icon delete-icon"
                            style={{
                              marginRight: '8px',
                              ...(shouldDisable ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tasks-tooltip-${rowUser.id}`}>
                              Ver Tarefas atribuídas
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTasks}
                            onClick={() =>
                              !shouldDisable && onViewTasks(rowUser.id)
                            }
                            className="action-icon view-tasks-icon"
                            style={{
                              marginRight: '8px',
                              ...(shouldDisable ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        {!shouldDisable ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip
                                id={`notifications-tooltip-${rowUser.id}`}
                              >
                                Ver Notificações
                              </Tooltip>
                            }
                          >
                            <div
                              style={{
                                position: 'relative',
                                display: 'inline-block',
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faBell}
                                onClick={() =>
                                  handleNavigateToNotifications(rowUser.id)
                                }
                                className="action-icon view-notifications-icon"
                              />
                              <NotificationBadge userId={rowUser.id} />
                            </div>
                          </OverlayTrigger>
                        ) : (
                          <div
                            style={{
                              position: 'relative',
                              display: 'inline-block',
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faBell}
                              style={disabledStyle}
                            />
                            <NotificationBadge userId={rowUser.id} />
                          </div>
                        )}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`extra-hours-tooltip-${rowUser.id}`}>
                              Horas Extra/Faltas
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faClock}
                            onClick={() =>
                              !shouldDisable && handleShowExtraHours(rowUser.id)
                            }
                            className="action-icon"
                            style={{
                              marginRight: '8px',
                              color: '#3174ad',
                              ...(shouldDisable ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        {/* Novo ícone para reset de senha - só aparece se usuário tiver permissão */}
                        {canResetPassword && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip
                                id={`password-reset-tooltip-${rowUser.id}`}
                              >
                                Redefinir Senha
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faKey}
                              onClick={() =>
                                onResetPassword && onResetPassword(rowUser.id)
                              }
                              className="action-icon"
                              style={{
                                marginRight: '8px',
                                color: '#007bff', // cor azul para destacar
                              }}
                            />
                          </OverlayTrigger>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  Não foram encontrados Colaboradores
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      <div className="pagination-container">
        <Pagination>
          <Pagination.Prev
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx}
              active={idx === page}
              onClick={() => onPageChange(idx)}
              className="d-none d-sm-block"
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          />
        </Pagination>
        <div className="page-info d-block d-sm-none">
          Página {page + 1} de {totalPages}
        </div>
      </div>

      <Modal show={showExtraHours} onHide={handleCloseExtraHours} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUserId
              ? `Horas Extra e Faltas - ${
                  users.find((u) => u.id === selectedUserId)?.name
                }`
              : 'Horas Extra e Faltas'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUserId && <UserExtraHoursCalendar userId={selectedUserId} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserTable;
