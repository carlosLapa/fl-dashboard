import React, { useState } from 'react';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { User } from 'types/user';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch the user data when the component mounts
  React.useEffect(() => {
    const fetchData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    fetchData();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Colaboradores</h2>
      <UserTable users={users} />
    </div>
  );
};

export default UsersPage;
