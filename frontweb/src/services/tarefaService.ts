import axios from '../api/apiConfig';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUserAndProjetoDTO,
  TarefaWithUsersDTO,
} from '../types/tarefa';
import { NotificationInsertDTO, NotificationType } from 'types/notification';
import { useNotification } from '../NotificationContext';
import {
  addTarefaAPI,
  deleteTarefaAPI,
  getAllTarefasWithUsersAndProjetoAPI,
  getTarefasSortedAPI,
  getTarefaWithUsersAndProjetoAPI,
  getTarefaWithUsersAPI,
  updateTarefaAPI,
  updateTarefaStatusAPI,
} from 'api/requestsApi';
import { ColunaWithProjetoDTO } from 'types/coluna';
import { getTarefasByDateRangeAPI } from 'api/requestsApi';

export const getTarefas = async (page: number = 0, pageSize: number = 10) => {
  try {
    // Updated to use relative URL
    const response = await axios.get(`/tarefas?page=${page}&size=${pageSize}`);
    return {
      content: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      size: response.data.size,
      number: response.data.number,
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: page,
    };
  }
};

export const getTarefaById = async (id: number): Promise<Tarefa | null> => {
  try {
    // Updated to use relative URL
    const response = await axios.get(`/tarefas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with id ${id}:`, error);
    return null;
  }
};

// Update getTarefasByUser to include pagination
export const getTarefasByUser = async (
  userId: number,
  page: number = 0,
  pageSize: number = 10
) => {
  try {
    // Updated to use relative URL
    const response = await axios.get(
      `/tarefas/user/${userId}/tasks?page=${page}&size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for user with id ${userId}:`, error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: page,
    };
  }
};

export const getTarefasByProjeto = async (
  projetoId: number
): Promise<Tarefa[]> => {
  try {
    // Updated to use relative URL
    const response = await axios.get(`/projetos/${projetoId}/tarefas`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching tasks for project with id ${projetoId}:`,
      error
    );
    return [];
  }
};

export const addTarefa = async (
  data: TarefaInsertFormData
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const newTarefa = await addTarefaAPI(data);

    data.userIds.forEach((userId) => {
      const notification: NotificationInsertDTO = {
        type: NotificationType.TAREFA_ATRIBUIDA,
        content: `Nova tarefa atribuída: "${newTarefa.descricao}"`,
        userId: userId,
        tarefaId: newTarefa.id,
        projetoId: newTarefa.projeto.id,
        relatedId: newTarefa.id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      // review this line: hook should only be used within React components or custom hooks, not directly in service functions. This might cause runtime errors.
      useNotification().sendNotification(notification);
    });

    return newTarefa;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const updateTarefa = async (
  id: number,
  data: TarefaUpdateFormData
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const updatedTarefa = await updateTarefaAPI(id, data);
    return updatedTarefa;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const deleteTarefa = async (id: number): Promise<void> => {
  try {
    await deleteTarefaAPI(id);
  } catch (error) {
    console.error('Error deleting tarefa:', error);
    throw error;
  }
};

export const getTarefaWithUsersAndProjeto = async (
  id: number
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const tarefaData = await getTarefaWithUsersAndProjetoAPI(id);
    return tarefaData;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const getTarefaWithUsers = async (
  id: number
): Promise<TarefaWithUsersDTO> => {
  try {
    const tarefaData = await getTarefaWithUsersAPI(id);
    return tarefaData;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const getColumnsForProject = async (
  projetoId: number
): Promise<ColunaWithProjetoDTO[]> => {
  try {
    // Updated to use relative URL
    const response = await axios.get(`/colunas/projeto/${projetoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching columns:', error);
    return [];
  }
};

export const getAllTarefasWithUsersAndProjeto = async (
  page: number = 0,
  size: number = 10
) => {
  const response = await getAllTarefasWithUsersAndProjetoAPI(page, size);
  if (Array.isArray(response)) {
    return {
      content: response,
      totalPages: Math.ceil(response.length / size),
    };
  }
  return response;
};

export const updateTarefaStatus = async (
  id: number,
  newStatus: TarefaStatus
): Promise<TarefaWithUsersDTO> => {
  try {
    const updatedTarefa = await updateTarefaStatusAPI(id, newStatus);
    return updatedTarefa;
  } catch (error) {
    console.error('Error in tarefa service:', error);
    throw error;
  }
};

export const getTarefasByDateRange = async (
  dateField: string,
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
) => {
  try {
    const response = await getTarefasByDateRangeAPI(
      dateField,
      startDate,
      endDate,
      page,
      size
    );

    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      return {
        content: response,
        totalPages: Math.ceil(response.length / size),
        totalElements: response.length,
        size: size,
        number: page,
      };
    }

    return response;
  } catch (error) {
    console.error('Error fetching tarefas by date range:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};

export const getTarefasSorted = async (
  sortField: string,
  sortDirection: 'ASC' | 'DESC',
  page: number = 0,
  size: number = 10
) => {
  try {
    const response = await getTarefasSortedAPI(
      sortField,
      sortDirection,
      page,
      size
    );
    return response;
  } catch (error) {
    console.error('Error fetching sorted tarefas:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};
