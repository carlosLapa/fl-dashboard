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
  formData: TarefaInsertFormData,
  onNotify?: (notification: NotificationInsertDTO) => Promise<void>
) => {
  try {
    const response = await addTarefaAPI(formData);

    // If a notification callback is provided and the task was created successfully
    if (onNotify && response) {
      // Create notifications for each assigned user
      for (const userId of formData.userIds) {
        const notification: NotificationInsertDTO = {
          type: NotificationType.TAREFA_ATRIBUIDA,
          content: `Nova tarefa "${formData.descricao}" atribuída a você`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: response.id,
          userId: userId,
          tarefaId: response.id,
          projetoId: formData.projetoId,
        };

        await onNotify(notification);
      }
    }

    return response;
  } catch (error) {
    console.error('Error adding tarefa:', error);
    throw error;
  }
};

export const updateTarefa = async (
  id: number,
  data: TarefaUpdateFormData,
  onNotify?: (notification: NotificationInsertDTO) => Promise<void>
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    const updatedTarefa = await updateTarefaAPI(id, data);

    // If a notification callback is provided and the task was updated successfully
    if (onNotify && updatedTarefa) {
      // Create notifications for each assigned user
      for (const userId of data.userIds) {
        const notification: NotificationInsertDTO = {
          type: NotificationType.TAREFA_EDITADA,
          content: `Tarefa "${data.descricao}" foi atualizada`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: updatedTarefa.id,
          userId: userId,
          tarefaId: updatedTarefa.id,
          projetoId: data.projetoId,
        };

        await onNotify(notification);
      }
    }

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
  newStatus: TarefaStatus,
  onNotify?: (notification: NotificationInsertDTO) => Promise<void>,
  tarefa?: TarefaWithUserAndProjetoDTO // Optional tarefa object for notification details
): Promise<TarefaWithUsersDTO> => {
  try {
    const updatedTarefa = await updateTarefaStatusAPI(id, newStatus);
    
    // If a notification callback is provided and the status was updated successfully
    if (onNotify && updatedTarefa && tarefa) {
      // Create notifications for each assigned user
      for (const user of tarefa.users) {
        const notification: NotificationInsertDTO = {
          type: NotificationType.TAREFA_STATUS_ALTERADO,
          content: `Status da tarefa "${tarefa.descricao}" alterado para ${newStatus}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: id,
          userId: user.id,
          tarefaId: id,
          projetoId: tarefa.projeto.id
        };
        
        await onNotify(notification);
      }
    }
    
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
