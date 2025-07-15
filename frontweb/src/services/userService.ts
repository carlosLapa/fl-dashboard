import { PaginatedUsers, User } from '../types/user';
import {
  createUserAPI,
  getCurrentUserWithRolesAPI,
  getUserByIdAPI,
  getUsersAPI,
} from '../api/requestsApi';

export const getUsers = async (
  page: number = 0,
  pageSize: number = 10
): Promise<PaginatedUsers> => {
  try {
    const response = await getUsersAPI(page, pageSize);
    console.log('Raw API response:', response);

    if (Array.isArray(response)) {
      return {
        content: response,
        totalPages: 1,
        totalElements: response.length,
        size: pageSize,
        number: page,
      };
    }

    return response;
  } catch (error) {
    console.error('Error loading users:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: page,
    };
  }
};

export const getCurrentUserWithRoles = async (): Promise<User> => {
  try {
    const userData = await getCurrentUserWithRolesAPI();
    console.log('Current user with roles:', userData); // Debug log
    return userData;
  } catch (error) {
    console.error('Error fetching current user with roles:', error);
    throw error;
  }
};

export const createUser = async (
  formData: FormData
): Promise<PaginatedUsers> => {
  try {
    const newUser = await createUserAPI(formData);
    return newUser;
  } catch (error) {
    console.error('Erro ao criar colaborador:', error);
    throw error;
  }
};

export const getUserById = async (userId: number): Promise<User> => {
  try {
    const userData = await getUserByIdAPI(userId);
    return userData;
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    throw error;
  }
};
