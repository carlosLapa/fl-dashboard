import axios from './apiConfig';
import {
  PaginatedProjetos,
  ProjetoFormData,
  ProjetoWithUsersAndTarefasDTO,
} from 'types/projeto';
import {
  PaginatedTarefas,
  TarefaInsertFormData,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUserAndProjetoDTO,
  TarefaWithUsersDTO,
} from 'types/tarefa';
import { Notification } from 'types/notification';

const fetchFromAPI = async (endpoint: string) => {
  const response = await axios.get(`/${endpoint}`);
  return response.data;
};

export const getUsersAPI = async (page: number = 0, size: number = 10) => {
  return await fetchFromAPI(`users?page=${page}&size=${size}`);
};

export const createUserAPI = async (formData: FormData) => {
  const response = await axios.post('/users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserByIdAPI = async (userId: number) => {
  try {
    const response = await axios.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserAPI = async (id: number, formData: FormData) => {
  try {
    const response = await axios.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error('Validation errors:', error.response.data);
    } else {
      console.error('Error updating user:', error);
    }
    throw error;
  }
};

export const deleteUserAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getProjetosAPI = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedProjetos> => {
  const response = await axios.get(`/projetos?page=${page}&size=${size}`);
  return response.data;
};
export const addProjetoAPI = async (projeto: ProjetoFormData) => {
  const response = await axios.post('/projetos', projeto);
  return response.data;
};

export const updateProjetoAPI = async (
  id: number,
  data: ProjetoFormData
): Promise<void> => {
  try {
    await axios.put(`/projetos/${id}`, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error('Validation errors:', error.response.data);
    } else {
      console.error('Error updating project:', error);
    }
    throw error;
  }
};

export const updateProjetoStatusAPI = async (
  projetoId: number,
  newStatus: string
) => {
  try {
    const response = await axios.patch(
      `/projetos/${projetoId}/status?status=${newStatus}`
    );
    return response.data;
  } catch (error) {
    console.error('Error updating projeto status:', error);
    throw error;
  }
};

export const deleteProjetoAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/projetos/${id}`);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getProjetoWithUsersAndTarefasAPI = async (
  id: number
): Promise<ProjetoWithUsersAndTarefasDTO> => {
  try {
    const response = await axios.get<ProjetoWithUsersAndTarefasDTO>(
      `/projetos/${id}/full`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project with users and tasks:', error);
    throw error;
  }
};

export const searchProjetosAPI = async (
  query: string,
  status?: string,
  page: number = 0,
  size: number = 10
) => {
  const endpoint =
    status && status !== 'ALL'
      ? `/projetos/search?query=${query}&status=${status}&page=${page}&size=${size}`
      : `/projetos/search?query=${query}&page=${page}&size=${size}`;

  const response = await axios.get(endpoint);
  return response.data;
};

export const getTarefaWithUsersAndProjetoAPI = async (
  tarefaId: number
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const response = await axios.get<TarefaWithUserAndProjetoDTO>(
      `/tarefas/${tarefaId}/full`
    );
    if (!response.data) {
      throw new Error('Tarefa not found or has been deleted');
    }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Tarefa not found or has been deleted');
    }
    console.error('Error fetching tarefa with users and projeto:', error);
    throw error;
  }
};

export const getTarefaWithUsersAPI = async (
  tarefaId: number
): Promise<TarefaWithUsersDTO> => {
  try {
    const response = await axios.get<TarefaWithUsersDTO>(
      `/tarefas/${tarefaId}/with-users`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tarefa with users:', error);
    throw error;
  }
};

export const getAllTarefasWithUsersAndProjetoAPI = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedTarefas> => {
  const response = await axios.get('/tarefas/full', {
    params: {
      page,
      size,
    },
  });
  console.log('API Response:', response.data); // Add this to check the response
  return response.data;
};

export const addTarefaAPI = async (
  data: TarefaInsertFormData
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const response = await axios.post<TarefaWithUserAndProjetoDTO>(
      '/tarefas/with-associations',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error adding tarefa:', error);
    throw error;
  }
};

export const updateTarefaAPI = async (
  id: number,
  data: TarefaUpdateFormData
) => {
  const response = await axios.put(`/tarefas/with-associations/${id}`, data);
  return response.data;
};

export const updateTarefaStatusAPI = async (
  tarefaId: number,
  newStatus: TarefaStatus
) => {
  try {
    const response = await axios.put<TarefaWithUsersDTO>(
      `/tarefas/${tarefaId}/status`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating tarefa status:', error);
    throw error;
  }
};

export const deleteTarefaAPI = async (id: number): Promise<void> => {
  await axios.delete(`/tarefas/${id}`);
};

export const getTarefasWithUsersAndProjetoByUser = async (
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedTarefas> => {
  try {
    const response = await axios.get(`/tarefas/user/${userId}/full`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching full tasks for user with id ${userId}:`,
      error
    );
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size,
      number: page,
    };
  }
};

export const getNotificationDetailsAPI = async (
  userId: number
): Promise<Notification[]> => {
  const response = await axios.get(`/notifications/user/${userId}/details`);
  return response.data;
};

export const markNotificationAsReadAPI = async (
  notificationId: number
): Promise<void> => {
  await axios.patch(`/notifications/${notificationId}/read`);
};

export const createNotificationAPI = async (
  notification: Notification
): Promise<Notification> => {
  const response = await axios.post('/notifications', notification);
  return response.data;
};
