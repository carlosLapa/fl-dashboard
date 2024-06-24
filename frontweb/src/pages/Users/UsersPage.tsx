import React, { useState } from 'react';
import UserTable from 'components/User/UserTable';
import { getUsers } from 'services/userService';
import { User } from 'types/user';

/**
 * functional component using the React.FC type.
 * Inside the component, it uses the useState hook to create a state variable called users
 * and a function setUsers to update the users state.
 * The initial value of users is set to an empty array [], and the type of users is specified
 * as an array of User objects using the type annotation <User[]>.
 */
const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

/**
* The following code block uses the useEffect hook to perform side effects in the component. 
The useEffect hook takes two arguments: a function to run after every render (in this case, fetchData), 
and an optional array of dependencies (which is an empty array [] here).

*Inside the useEffect hook, an asynchronous function fetchData is defined. 
This function calls the getUsers function (which is likely imported from another module) using the await keyword. 
The await keyword is used to wait for the asynchronous operation (fetching user data) to complete. 
The result of getUsers is stored in the usersData constant.

*After fetching the user data, the setUsers function is called with usersData as the argument. 
This updates the users state with the fetched user data.

*The fetchData function is then called immediately after it is defined.

*The empty dependency array [] passed to the useEffect hook ensures that the effect (fetching user data) runs only once, 
on the initial render of the component. 
If the dependency array contained any values, the effect would run again whenever those values change.
*/

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
