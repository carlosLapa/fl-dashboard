import { User } from 'types/user';
import { getUsersAPI } from 'api/requestsApi';

/**
* asynchronous function (and wrapper around the getUsersAPI() function) 
* named getUsers that returns a Promise resolving to an array of User objects. 
* The async keyword allows the use of the await keyword inside the function, 
* which is used to wait for asynchronous operations (like API calls) to complete.
 */

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersData = await getUsersAPI();
    console.log('Service getUsers data:', usersData);
    return usersData;
  } catch (error) {
    console.error('Erro ao carregar os projetos:', error);
    return [];
  }
};
