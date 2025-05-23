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
} from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useNotification } from 'NotificationContext';
import NotificationBadge from './../NotificationBox/NotificationBadge';
import './styles.scss';

interface UserTableProps {
  users: User[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onViewTasks: (userId: number) => void;
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
  page,
  onPageChange,
  totalPages,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const { loadStoredNotifications } = useNotification();

  const handleNavigateToNotifications = async (userId: number) => {
    await loadStoredNotifications(userId);
    navigate(`/notifications/${userId}`);
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
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td className="d-none d-md-table-cell">{user.funcao}</td>
                  <td className="d-none d-md-table-cell">{user.cargo}</td>
                  <td className="d-none d-lg-table-cell">{user.email}</td>
                  <td className="d-none d-lg-table-cell">
                    {user.profileImage ? (
                      <div className="profile-image-cell">
                        <img
                          src={`data:image/jpeg;base64,${user.profileImage}`}
                          alt={`${user.name}`}
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
                          <Tooltip id={`edit-tooltip-${user.id}`}>
                            Editar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditUser(user.id)}
                          className="action-icon edit-icon"
                          style={{ marginRight: '8px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`delete-tooltip-${user.id}`}>
                            Eliminar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteUser(user.id)}
                          className="action-icon delete-icon"
                          style={{ marginRight: '8px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tasks-tooltip-${user.id}`}>
                            Ver Tarefas atribuídas
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTasks}
                          onClick={() => onViewTasks(user.id)}
                          className="action-icon view-tasks-icon"
                          style={{ marginRight: '8px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`notifications-tooltip-${user.id}`}>
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
                              handleNavigateToNotifications(user.id)
                            }
                            className="action-icon view-notifications-icon"
                          />
                          <NotificationBadge userId={user.id} />
                        </div>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
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
    </div>
  );
};

export default UserTable;
