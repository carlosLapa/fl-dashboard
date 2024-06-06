import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { User } from '../../types/user';
import { BASE_URL } from 'util/requests';

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(BASE_URL + '/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Colaboradores</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Apelido</th>
            <th>Função</th>
            <th>Cargo</th>
            <th>Email</th>
            <th>Imagem de perfil</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.funcao}</td>
              <td>{user.cargo}</td>
              <td>{user.email}</td>
              <td>
                {user.profileImage ? (
                  <img
                    src={`data:image/jpeg;base64,${user.profileImage}`}
                    alt={`${user.firstName} ${user.lastName}`}
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
