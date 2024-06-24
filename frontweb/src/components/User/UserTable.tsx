import React from 'react';
import Table from 'react-bootstrap/Table';
import { User } from '../../types/user';

import './styles.css';

/*
* defines an interface called UserTableProps that describes the shape of the props
* that the UserTable component expects. 
* In this case, it expects a single prop called users, which should be an array of User objects.
*/
interface UserTableProps {
  users: User[];
}

/**
 * declares the UserTable component as a functional component using the React.FC type. 
 * The component takes in props of type UserTableProps, 
 * and the users prop is destructured from the props object.
 */
const UserTable: React.FC<UserTableProps> = ({ users }) => {
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
                    style={{ maxWidth: '80px', maxHeight: '80px' }}
                  />
                ) : (
                  'No image available'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserTable;
