import { User } from 'types/user';
import { getUsersAPI } from 'api/requestsApi';

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
