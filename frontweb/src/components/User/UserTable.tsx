import React from 'react';
import Table from 'react-bootstrap/Table';
import { User } from '../../types/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import './styles.css';

interface UserTableProps {
  users: User[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
}) => {
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
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    onClick={() => onEditUser(user.id)}
                    className="mr-2 edit-icon"
                  />
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    onClick={() => onDeleteUser(user.id)}
                    className="delete-icon"
                  />
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
