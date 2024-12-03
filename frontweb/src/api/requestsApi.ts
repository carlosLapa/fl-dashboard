// api/projectApi.ts
import axios from 'axios';
import { BASE_URL } from '../util/requests';
import { Projeto, ProjetoFormData, ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import {
  TarefaInsertFormData,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUsersAndProjetoDTO,
  TarefaWithUsersDTO,
} from 'types/tarefa';
import { Notification } from 'types/notification';
import { getTarefasByUser } from 'services/tarefaService';

const fetchFromAPI = async (endpoint: string) => {
  const response = await axios.get(`${BASE_URL}/${endpoint}`);
  return response.data;
};

export const getUsersAPI = async () => {
  return await fetchFromAPI('users');
};

export const createUserAPI = async (formData: FormData) => {
  const response = await axios.post(`${BASE_URL}/users`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserByIdAPI = async (userId: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUserAPI = async (id: number, formData: FormData) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, formData, {
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
    await axios.delete(`${BASE_URL}/users/${id}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getProjetosAPI = async () => {
  const response = await axios.get(`${BASE_URL}/projetos`);
  return response.data.content || [];
};

export const addProjetoAPI = async (projeto: ProjetoFormData) => {
  const response = await axios.post(`${BASE_URL}/projetos`, projeto);
  return response.data;
};

export const updateProjetoAPI = async (
  id: number,
  data: ProjetoFormData
): Promise<void> => {
  try {
    await axios.put(`${BASE_URL}/projetos/${id}`, data);
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
      `${BASE_URL}/projetos/${projetoId}/status?status=${newStatus}`
    );
    return response.data;
  } catch (error) {
    console.error('Error updating projeto status:', error);
    throw error;
  }
};

export const deleteProjetoAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/projetos/${id}`);
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
      `${BASE_URL}/projetos/${id}/full`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching project with users and tasks:', error);
    throw error;
  }
};

export const searchProjetosAPI = async (query: string, status?: string) => {
  const endpoint =
    status && status !== 'ALL'
      ? `${BASE_URL}/projetos/search?query=${query}&status=${status}`
      : `${BASE_URL}/projetos/search?query=${query}`;

  const response = await axios.get(endpoint);
  return response.data;
};

export const getTarefaWithUsersAndProjetoAPI = async (
  tarefaId: number
): Promise<TarefaWithUsersAndProjetoDTO> => {
  try {
    const response = await axios.get<TarefaWithUsersAndProjetoDTO>(
      `${BASE_URL}/tarefas/${tarefaId}/full`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tarefa with users and projeto:', error);
    throw error;
  }
};

export const getTarefaWithUsersAPI = async (
  tarefaId: number
): Promise<TarefaWithUsersDTO> => {
  try {
    const response = await axios.get<TarefaWithUsersDTO>(
      `${BASE_URL}/tarefas/${tarefaId}/with-users`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching tarefa with users:', error);
    throw error;
  }
};

export const getAllTarefasWithUsersAndProjetoAPI = async (): Promise<
  TarefaWithUsersAndProjetoDTO[]
> => {
  try {
    const response = await axios.get(`${BASE_URL}/tarefas/full`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all tarefas with users and projeto:', error);
    throw error;
  }
};

export const addTarefaAPI = async (
  data: TarefaInsertFormData
): Promise<TarefaWithUsersAndProjetoDTO> => {
  try {
    const response = await axios.post<TarefaWithUsersAndProjetoDTO>(
      `${BASE_URL}/tarefas/with-associations`,
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
  const response = await axios.put(
    `${BASE_URL}/tarefas/with-associations/${id}`,
    data
  );
  return response.data;
};

export const updateTarefaStatusAPI = async (
  tarefaId: number,
  newStatus: TarefaStatus
) => {
  try {
    const response = await axios.put<TarefaWithUsersDTO>(
      `${BASE_URL}/tarefas/${tarefaId}/status`,
      { status: newStatus }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating tarefa status:', error);
    throw error;
  }
};

export const deleteTarefaAPI = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/tarefas/${id}`);
};

// O mais eficiente será implementar um método no backend que retorne
// as tarefas - e o projeto associado - de um user específico.
export const getTarefasWithUsersAndProjetoByUser = async (
  userId: number
): Promise<TarefaWithUsersAndProjetoDTO[]> => {
  try {
    const userTarefas = await getTarefasByUser(userId);
    const fullTarefas = await Promise.all(
      userTarefas.map((tarefa) => getTarefaWithUsersAndProjetoAPI(tarefa.id))
    );
    return fullTarefas;
  } catch (error) {
    console.error(
      `Error fetching full tasks for user with id ${userId}:`,
      error
    );
    return [];
  }
};

// Notifications

export const getNotificationDetailsAPI = async (
  userId: number
): Promise<Notification[]> => {
  const response = await axios.get(
    `${BASE_URL}/notifications/user/${userId}/details`
  );
  return response.data;
};

export const markNotificationAsReadAPI = async (
  notificationId: number
): Promise<void> => {
  await axios.patch(`${BASE_URL}/notifications/${notificationId}/read`);
};

export const createNotificationAPI = async (
  notification: Notification
): Promise<Notification> => {
  const response = await axios.post(`${BASE_URL}/notifications`, notification);
  return response.data;
};
