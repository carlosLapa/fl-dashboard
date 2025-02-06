import React from 'react';
import Table from 'react-bootstrap/Table';
import { Pagination } from 'react-bootstrap';
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
import './styles.css';

interface UserTableProps {
  users: User[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onViewTasks: (userId: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onViewTasks,
  page,
  onPageChange,
  totalPages,
}) => {
  const navigate = useNavigate();
  const { loadStoredNotifications } = useNotification();

  const handleNavigateToNotifications = async (userId: number) => {
    await loadStoredNotifications(userId);
    navigate(`/notifications/${userId}`);
  };

  return (
    <div className="user-container">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Função</th>
            <th>Cargo</th>
            <th>Email</th>
            <th>Imagem de perfil</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) ? (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.funcao}</td>
                <td>{user.cargo}</td>
                <td>{user.email}</td>
                <td>
                  {user.profileImage ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profileImage}`}
                      alt={`${user.name}`}
                      style={{
                        maxWidth: '90px',
                        maxHeight: '90px',
                        marginLeft: '25%',
                      }}
                    />
                  ) : (
                    <span>Sem imagem</span>
                  )}
                </td>
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`edit-tooltip-${user.id}`}>Editar</Tooltip>
                    }
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      onClick={() => onEditUser(user.id)}
                      className="edit-icon"
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
                      className="delete-icon"
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
                      className="view-tasks-icon"
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
                      style={{ position: 'relative', display: 'inline-block' }}
                    >
                      <FontAwesomeIcon
                        icon={faBell}
                        onClick={() => handleNavigateToNotifications(user.id)}
                        className="view-notifications-icon"
                      />
                      <NotificationBadge userId={user.id} />
                    </div>
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>Não foram encontrados Colaboradores</td>
            </tr>
          )}
        </tbody>
      </Table>
      <div className="d-flex justify-content-center mt-3">
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
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          />
        </Pagination>
      </div>
    </div>
  );
};

export default UserTable;
