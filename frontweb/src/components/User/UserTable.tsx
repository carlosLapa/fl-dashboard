import React from 'react';
import Table from 'react-bootstrap/Table';
import { User } from '../../types/user';

import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface UserTableProps {
  users: User[];
}

const UserTable: React.FC<UserTableProps> = ({ users }) => {
  function onEditUser(user: User): void {
    throw new Error('Function not implemented.');
  }

  function onDeleteUser(id: number): void {
    throw new Error('Function not implemented.');
  }

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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.funcao}</td>
              <td>{user.cargo}</td>
              <td>{user.email}</td>
              <td>
                {user.profileImage ? (
                  <img
                    src={`data:image/jpeg;base64,${user.profileImage}`}
                    alt={`${user.username}`}
                    style={{ maxWidth: '90px', maxHeight: '90px', marginLeft: '25%' }}
                  />
                ) : (
                  'No image available'
                )}
              </td>
              <td>
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    onClick={() => onEditUser(user)}
                    className="mr-2 edit-icon"
                  />
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    onClick={() => onDeleteUser(user.id)}
                    className="delete-icon"
                  />
                </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserTable;
