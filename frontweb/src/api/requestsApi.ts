import axios from 'api/apiConfig';
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
import { Notification, NotificationInsertDTO } from 'types/notification';

let pendingRequests: Record<string, Promise<PaginatedTarefas>> = {};

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
  try {
    const endpoint =
      status && status !== 'ALL'
        ? `/projetos/search?query=${query}&status=${status}&page=${page}&size=${size}`
        : `/projetos/search?query=${query}&page=${page}&size=${size}`;

    console.log('Searching projects with endpoint:', endpoint);

    const response = await axios.get(endpoint);
    console.log('Raw search response:', response.data);

    // Handle both array response and paginated response
    if (Array.isArray(response.data)) {
      // If the response is a direct array of projects
      return {
        content: response.data,
        totalPages: 1,
        totalElements: response.data.length,
        size: response.data.length,
        number: 0,
      };
    } else if (response.data && response.data.content) {
      // If the response is a paginated object
      return response.data;
    } else {
      console.warn('Unexpected response structure:', response.data);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 0,
        number: 0,
      };
    }
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
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

export const getProjetosByDateRangeAPI = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedProjetos> => {
  try {
    let url = `/projetos/date-range?page=${page}&size=${size}`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching projetos by date range:', error);
    throw error;
  }
};

export const getProjetosWithFiltersAPI = async (
  filters: {
    designacao?: string;
    entidade?: string;
    prioridade?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  },
  page: number = 0,
  size: number = 10
): Promise<PaginatedProjetos> => {
  try {
    let url = `/projetos/filter?page=${page}&size=${size}`;

    // Add all filters to the URL
    if (filters.designacao) {
      url += `&designacao=${encodeURIComponent(filters.designacao)}`;
    }
    if (filters.entidade) {
      url += `&entidade=${encodeURIComponent(filters.entidade)}`;
    }
    if (filters.prioridade) {
      url += `&prioridade=${encodeURIComponent(filters.prioridade)}`;
    }
    if (filters.startDate) {
      url += `&startDate=${filters.startDate}`;
    }
    if (filters.endDate) {
      url += `&endDate=${filters.endDate}`;
    }
    if (filters.status && filters.status !== 'ALL') {
      url += `&status=${filters.status}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching projetos with filters:', error);
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
  const requestKey = `user_${userId}_page_${page}_size_${size}`;

  // Check if this exact request is already in progress
  if (requestKey in pendingRequests) {
    console.log(`Reusing pending request for ${requestKey}`);
    return pendingRequests[requestKey];
  }

  try {
    console.log(`Making new request for ${requestKey}`);
    // Create the promise for this request
    const requestPromise = axios
      .get(`/tarefas/user/${userId}/full`, {
        params: { page, size },
      })
      .then((response) => response.data);

    // Store the promise
    pendingRequests[requestKey] = requestPromise;

    // Wait for the response
    const response = await requestPromise;

    // Request completed, remove from pending
    delete pendingRequests[requestKey];

    return response;
  } catch (error) {
    // Request failed, remove from pending
    delete pendingRequests[requestKey];

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

export const getTarefasByDateRangeAPI = async (
  dateField: string,
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedTarefas> => {
  try {
    let url = `/tarefas/date-range?dateField=${dateField}&page=${page}&size=${size}`;

    if (startDate) {
      url += `&startDate=${startDate}`;
    }

    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    const response = await axios.get(url);
    console.log('Date filter API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching tarefas by date range:', error);
    throw error;
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
  notification: NotificationInsertDTO
): Promise<Notification> => {
  const response = await axios.post('/notifications', notification);
  return response.data;
};

export const getTarefasSortedAPI = async (
  sortField: string,
  sortDirection: 'ASC' | 'DESC',
  page: number = 0,
  size: number = 10
): Promise<PaginatedTarefas> => {
  try {
    const response = await axios.get(
      `/tarefas/sorted?sort=${sortField}&direction=${sortDirection}&page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching sorted tarefas:', error);
    throw error;
  }
};

/**
 * Recalculate working days for a specific tarefa
 * @param tarefaId The ID of the tarefa to recalculate working days for
 */
export const recalculateWorkingDaysAPI = async (
  tarefaId: number
): Promise<void> => {
  try {
    await axios.post(`/tarefas/${tarefaId}/recalculate-working-days`);
  } catch (error) {
    console.error('Error recalculating working days:', error);
    throw error;
  }
};

/**
 * Update working days for a specific tarefa
 * @param tarefaId The ID of the tarefa to update
 * @param workingDays The number of working days to set
 */
export const updateWorkingDaysAPI = async (
  tarefaId: number,
  workingDays: number
) => {
  try {
    const response = await axios.put(
      `/tarefas/${tarefaId}/working-days`,
      workingDays
    );
    return response.data;
  } catch (error) {
    console.error('Error updating working days:', error);
    throw error;
  }
};
