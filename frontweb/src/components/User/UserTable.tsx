import React from 'react';
import Table from 'react-bootstrap/Table';
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

import './styles.css';

interface UserTableProps {
  users: User[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onViewTasks: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onViewTasks,
}) => {
  const navigate = useNavigate();

  const handleNavigateToNotifications = (userId: number) => {
    console.log('Navigating to notifications for User ID:', userId);
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
                    <FontAwesomeIcon
                      icon={faBell}
                      onClick={() => handleNavigateToNotifications(user.id)}
                      className="view-notifications-icon"
                    />
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
    </div>
  );
};

export default UserTable;
