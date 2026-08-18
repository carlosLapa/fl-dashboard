import { PaginatedUsers, User } from '../types/user';
import {
  createUserAPI,
  deactivateUserAPI,
  getCurrentUserWithRolesAPI,
  getUserByIdAPI,
  getUsersAPI,
  reactivateUserAPI,
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

// Spring's `/users` endpoint is paginated; fetches every page so callers
// that need the full collaborator list (e.g. Tarefa/Projeto assignment
// dropdowns) never silently truncate at the default page size. Returns
// everyone, active or not — callers that only want to offer *new*
// assignments should filter out inactive users themselves, keeping anyone
// already assigned/selected visible (see e.g. TarefaModal, ProjetoModal).
export const getAllUsers = async (): Promise<User[]> => {
  const pageSize = 100;
  let page = 0;
  let totalPages = 1;
  let allUsers: User[] = [];

  do {
    const response = await getUsersAPI(page, pageSize);
    allUsers = allUsers.concat(response.content || []);
    totalPages = response.totalPages || 1;
    page += 1;
  } while (page < totalPages);

  return allUsers;
};

export const deactivateUser = async (userId: number): Promise<User> => {
  try {
    return await deactivateUserAPI(userId);
  } catch (error) {
    console.error('Erro ao desativar colaborador:', error);
    throw error;
  }
};

export const reactivateUser = async (userId: number): Promise<User> => {
  try {
    return await reactivateUserAPI(userId);
  } catch (error) {
    console.error('Erro ao reativar colaborador:', error);
    throw error;
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
