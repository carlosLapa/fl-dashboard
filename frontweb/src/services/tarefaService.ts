import axios from '../api/apiConfig';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUserAndProjetoDTO,
  TarefaWithUsersDTO,
} from '../types/tarefa';
import {
  addTarefaAPI,
  arquivarTarefaAPI,
  deleteTarefaAPI,
  getAllTarefasWithUsersAndProjetoAPI,
  getTarefasArquivadasByProjetoAPI,
  getTarefasFilteredAPI,
  getTarefasSortedAPI,
  getTarefaWithUsersAndProjetoAPI,
  getTarefaWithUsersAPI,
  reativarTarefaAPI,
  updateTarefaAPI,
  updateTarefaStatusAPI,
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
  prioridade?: string;
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

export const addTarefa = async (formData: TarefaInsertFormData) => {
  try {
    let dataToSend = { ...formData };
    if (formData.prazoEstimado && formData.prazoReal) {
      dataToSend.workingDays = calculateWorkingDays(
        formData.prazoEstimado,
        formData.prazoReal
      );
    }
    // The backend already notifies each assigned user (TAREFA_ATRIBUIDA) as
    // part of creating the tarefa — sending another one here duplicated it.
    return await addTarefaAPI(dataToSend);
  } catch (error) {
    console.error('Error adding tarefa:', error);

    // Handle specific deadline validation errors
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      if (error.response.data.message.includes('prazo')) {
        throw new Error(error.response.data.message);
      }
    }

    throw error;
  }
};

export const updateTarefa = async (
  id: number,
  data: TarefaUpdateFormData
): Promise<TarefaWithUserAndProjetoDTO> => {
  try {
    // The backend already notifies affected users (TAREFA_ATRIBUIDA/
    // TAREFA_REMOVIDA/TAREFA_EDITADA) as part of the update — sending
    // another one here duplicated it.
    return await updateTarefaAPI(id, data);
  } catch (error) {
    console.error('Error updating tarefa:', error);

    // Handle specific deadline validation errors
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      if (error.response.data.message.includes('prazo')) {
        throw new Error(error.response.data.message);
      }
    }

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

export const arquivarTarefa = async (id: number): Promise<TarefaWithUsersDTO> => {
  try {
    return await arquivarTarefaAPI(id);
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409 &&
      error.response?.data?.message
    ) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const reativarTarefa = async (id: number): Promise<TarefaWithUsersDTO> => {
  return await reativarTarefaAPI(id);
};

export const getTarefasArquivadasByProjeto = async (projetoId: number) => {
  return await getTarefasArquivadasByProjetoAPI(projetoId);
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
  newStatus: TarefaStatus
): Promise<TarefaWithUsersDTO> => {
  try {
    // The backend already notifies every assigned user, and the project
    // coordinator if not already assigned, as part of the status update —
    // sending another one here duplicated it.
    const updatedTarefa = await updateTarefaStatusAPI(id, newStatus);

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
    console.error('[Service] Erro em updateTarefaStatus:', error);

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 409 &&
      error.response?.data?.message
    ) {
      throw new Error(error.response.data.message);
    }

    throw error;
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
