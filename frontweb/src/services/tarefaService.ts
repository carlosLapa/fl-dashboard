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
  getTarefasByDateRangeAPI,
} from 'api/requestsApi';
import { ColunaWithProjetoDTO } from 'types/coluna';

// Define the interface for filter parameters
export interface TarefaFilterParams {
  page: number;
  size: number;
  sort: string;
  direction?: string;
  descricao?: string;
  status?: string;
  projetoId?: string;
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
  currentDate.setHours(0, 0, 0, 0);
  const endDateMidnight = new Date(endDate);
  endDateMidnight.setHours(0, 0, 0, 0);
  while (currentDate <= endDateMidnight) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return workingDays;
};

// All API calls below rely on backend permission logic (JWT in Authorization header).

export const getTarefas = async (page: number = 0, pageSize: number = 10) => {
  try {
    const response = await axios.get(`/tarefas?page=${page}&size=${pageSize}`);
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
      ...response.data,
      content: tarefasWithWorkingDays,
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
    const response = await axios.get(`/tarefas/${id}`);
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

export const getTarefasByUser = async (
  userId: number,
  page: number = 0,
  pageSize: number = 10
) => {
  try {
    const response = await axios.get(
      `/tarefas/user/${userId}/full?page=${page}&size=${pageSize}`
    );
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
      ...response.data,
      content: tarefasWithWorkingDays,
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
    const response = await axios.get(`/projetos/${projetoId}/tarefas`);
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
    let dataToSend = { ...formData };
    if (formData.prazoEstimado && formData.prazoReal) {
      dataToSend.workingDays = calculateWorkingDays(
        formData.prazoEstimado,
        formData.prazoReal
      );
    }
    const response = await addTarefaAPI(dataToSend);
    if (onNotify && response) {
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
    let dataToSend = { ...data };
    if (data.prazoEstimado && data.prazoReal) {
      dataToSend.workingDays = calculateWorkingDays(
        data.prazoEstimado,
        data.prazoReal
      );
    }
    const updatedTarefa = await updateTarefaAPI(id, dataToSend);
    if (onNotify && updatedTarefa) {
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
  if (response.content) {
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
  tarefa?: TarefaWithUserAndProjetoDTO
): Promise<TarefaWithUsersDTO> => {
  try {
    const updatedTarefa = await updateTarefaStatusAPI(id, newStatus);
    if (onNotify && updatedTarefa && tarefa) {
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
    if (Array.isArray(response)) {
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
    if (response.content) {
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
    if (response.content) {
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

export const getTarefasFiltered = async (params: TarefaFilterParams) => {
  try {
    const apiParams = { ...params };
    const response = await getTarefasFilteredAPI(apiParams);
    if (response.content) {
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
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: params.size,
      number: params.page,
    };
  }
};
