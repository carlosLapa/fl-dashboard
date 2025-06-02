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
  getTarefasFilteredAPI,
  getTarefasSortedAPI,
  getTarefaWithUsersAndProjetoAPI,
  getTarefaWithUsersAPI,
  updateTarefaAPI,
  updateTarefaStatusAPI,
} from 'api/requestsApi';
import { ColunaWithProjetoDTO } from 'types/coluna';
import { getTarefasByDateRangeAPI } from 'api/requestsApi';

// Define the interface for filter parameters
export interface TarefaFilterParams {
  page: number;
  size: number;
  sort: string;
  direction?: string;
  descricao?: string;
  status?: string;
  projeto?: string;
  dateField?: string;
  startDate?: string;
  endDate?: string;
}

// Helper function to calculate working days between two dates
export const calculateWorkingDays = (
  startDateStr: string,
  endDateStr: string
): number => {
  if (!startDateStr || !endDateStr) return 0;
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  let workingDays = 0;
  let currentDate = new Date(startDate);
  // Set both dates to midnight to ensure we're only comparing dates, not times
  currentDate.setHours(0, 0, 0, 0);
  const endDateMidnight = new Date(endDate);
  endDateMidnight.setHours(0, 0, 0, 0);
  // Count working days
  while (currentDate <= endDateMidnight) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      // 0 is Sunday, 6 is Saturday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return workingDays;
};

export const getTarefas = async (page: number = 0, pageSize: number = 10) => {
  try {
    // Updated to use relative URL
    const response = await axios.get(`/tarefas?page=${page}&size=${pageSize}`);
    // Calculate working days for each tarefa
    const tarefasWithWorkingDays = response.data.content.map((tarefa: any) => {
      if (tarefa.prazoEstimado && tarefa.prazoReal) {
        return {
          ...tarefa,
          workingDays: calculateWorkingDays(
            tarefa.prazoEstimado,
            tarefa.prazoReal
          ),
        };
      }
      return tarefa;
    });
    return {
      content: tarefasWithWorkingDays,
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
    // Calculate working days if both dates are available
    if (response.data.prazoEstimado && response.data.prazoReal) {
      return {
        ...response.data,
        workingDays: calculateWorkingDays(
          response.data.prazoEstimado,
          response.data.prazoReal
        ),
      };
    }
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
    // Calculate working days for each tarefa
    const tarefasWithWorkingDays = response.data.content.map((tarefa: any) => {
      if (tarefa.prazoEstimado && tarefa.prazoReal) {
        return {
          ...tarefa,
          workingDays: calculateWorkingDays(
            tarefa.prazoEstimado,
            tarefa.prazoReal
          ),
        };
      }
      return tarefa;
    });
    return {
      content: tarefasWithWorkingDays,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
      size: response.data.size,
      number: response.data.number,
    };
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
    // Calculate working days for each tarefa
    const tarefasWithWorkingDays = response.data.map((tarefa: any) => {
      if (tarefa.prazoEstimado && tarefa.prazoReal) {
        return {
          ...tarefa,
          workingDays: calculateWorkingDays(
            tarefa.prazoEstimado,
            tarefa.prazoReal
          ),
        };
      }
      return tarefa;
    });
    return tarefasWithWorkingDays;
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
    // Calculate working days if both dates are provided
    let dataToSend = { ...formData };
    if (formData.prazoEstimado && formData.prazoReal) {
      dataToSend.workingDays = calculateWorkingDays(
        formData.prazoEstimado,
        formData.prazoReal
      );
    }
    const response = await addTarefaAPI(dataToSend);
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
    // Calculate working days if both dates are provided
    let dataToSend = { ...data };
    if (data.prazoEstimado && data.prazoReal) {
      dataToSend.workingDays = calculateWorkingDays(
        data.prazoEstimado,
        data.prazoReal
      );
    }
    const updatedTarefa = await updateTarefaAPI(id, dataToSend);
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
    // Calculate working days if both dates are available
    if (tarefaData.prazoEstimado && tarefaData.prazoReal) {
      return {
        ...tarefaData,
        workingDays: calculateWorkingDays(
          tarefaData.prazoEstimado,
          tarefaData.prazoReal
        ),
      };
    }
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
    // Calculate working days if both dates are available
    if (tarefaData.prazoEstimado && tarefaData.prazoReal) {
      return {
        ...tarefaData,
        workingDays: calculateWorkingDays(
          tarefaData.prazoEstimado,
          tarefaData.prazoReal
        ),
      };
    }
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
  // Process array response
  if (Array.isArray(response)) {
    // Calculate working days for each tarefa
    const tarefasWithWorkingDays = response.map((tarefa: any) => {
      if (tarefa.prazoEstimado && tarefa.prazoReal) {
        return {
          ...tarefa,
          workingDays: calculateWorkingDays(
            tarefa.prazoEstimado,
            tarefa.prazoReal
          ),
        };
      }
      return tarefa;
    });
    return {
      content: tarefasWithWorkingDays,
      totalPages: Math.ceil(tarefasWithWorkingDays.length / size),
    };
  }
  // Process paginated response
  if (response.content) {
    // Calculate working days for each tarefa
    const tarefasWithWorkingDays = response.content.map((tarefa: any) => {
      if (tarefa.prazoEstimado && tarefa.prazoReal) {
        return {
          ...tarefa,
          workingDays: calculateWorkingDays(
            tarefa.prazoEstimado,
            tarefa.prazoReal
          ),
        };
      }
      return tarefa;
    });
    return {
      ...response,
      content: tarefasWithWorkingDays,
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
          projetoId: tarefa.projeto.id,
        };
        await onNotify(notification);
      }
    }
    // Calculate working days if both dates are available
    if (updatedTarefa.prazoEstimado && updatedTarefa.prazoReal) {
      return {
        ...updatedTarefa,
        workingDays: calculateWorkingDays(
          updatedTarefa.prazoEstimado,
          updatedTarefa.prazoReal
        ),
      };
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
      // Calculate working days for each tarefa
      const tarefasWithWorkingDays = response.map((tarefa: any) => {
        if (tarefa.prazoEstimado && tarefa.prazoReal) {
          return {
            ...tarefa,
            workingDays: calculateWorkingDays(
              tarefa.prazoEstimado,
              tarefa.prazoReal
            ),
          };
        }
        return tarefa;
      });
      return {
        content: tarefasWithWorkingDays,
        totalPages: Math.ceil(tarefasWithWorkingDays.length / size),
        totalElements: tarefasWithWorkingDays.length,
        size: size,
        number: page,
      };
    }
    // Process paginated response
    if (response.content) {
      // Calculate working days for each tarefa
      const tarefasWithWorkingDays = response.content.map((tarefa: any) => {
        if (tarefa.prazoEstimado && tarefa.prazoReal) {
          return {
            ...tarefa,
            workingDays: calculateWorkingDays(
              tarefa.prazoEstimado,
              tarefa.prazoReal
            ),
          };
        }
        return tarefa;
      });
      return {
        ...response,
        content: tarefasWithWorkingDays,
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
    // Process paginated response
    if (response.content) {
      // Calculate working days for each tarefa
      const tarefasWithWorkingDays = response.content.map((tarefa: any) => {
        if (tarefa.prazoEstimado && tarefa.prazoReal) {
          return {
            ...tarefa,
            workingDays: calculateWorkingDays(
              tarefa.prazoEstimado,
              tarefa.prazoReal
            ),
          };
        }
        return tarefa;
      });
      return {
        ...response,
        content: tarefasWithWorkingDays,
      };
    }
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

// New function to fetch tarefas with advanced filtering
export const getTarefasFiltered = async (params: TarefaFilterParams) => {
  // Add debugging logs
  console.log('Filter params before API call:', params);

  try {
    // Create a copy of params to avoid modifying the original
    const apiParams = { ...params };

    // Log specific project filter value if it exists
    if (apiParams.projeto) {
      console.log('Project filter value:', apiParams.projeto);
    }

    const response = await getTarefasFilteredAPI(apiParams);
    console.log('API response:', response);

    // Process the response
    if (response.content) {
      // Calculate working days for each tarefa
      const tarefasWithWorkingDays = response.content.map((tarefa: any) => {
        if (tarefa.prazoEstimado && tarefa.prazoReal) {
          return {
            ...tarefa,
            workingDays: calculateWorkingDays(
              tarefa.prazoEstimado,
              tarefa.prazoReal
            ),
          };
        }
        return tarefa;
      });
      return {
        ...response,
        content: tarefasWithWorkingDays,
      };
    }
    return response;
  } catch (error) {
    console.error('Error fetching filtered tarefas:', error);
    // Log the actual error for debugging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }

    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: params.size,
      number: params.page,
    };
  }
};
