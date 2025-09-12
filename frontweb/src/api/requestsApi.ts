import axios from 'api/apiConfig';
import {
  PaginatedProjetos,
  Projeto,
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
import { PaginatedUsers } from 'types/user';

let pendingRequests: Record<string, Promise<PaginatedTarefas>> = {};

const fetchFromAPI = async (endpoint: string) => {
  const response = await axios.get(`/${endpoint}`);
  return response.data;
};

export const getUsersAPI = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedUsers> => {
  try {
    const response = await fetchFromAPI(`users?page=${page}&size=${size}`);
    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return an empty paginated result instead of throwing
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size,
      number: page,
    };
  }
};

export const getCurrentUserWithRolesAPI = async () => {
  try {
    const response = await axios.get('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user with roles:', error);
    throw error;
  }
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
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
): Promise<PaginatedProjetos> => {
  try {
    let url = `/projetos?page=${page}&size=${size}`;

    if (sort) {
      url += `&sort=${sort},${direction || 'ASC'}`;
    }

    console.log(`Making GET request to: ${url}`);
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching projetos:', error);
    // Return empty result on error
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size,
      number: page,
    };
  }
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
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
) => {
  try {
    let endpoint =
      status && status !== 'ALL'
        ? `/projetos/search?query=${query}&status=${status}&page=${page}&size=${size}`
        : `/projetos/search?query=${query}&page=${page}&size=${size}`;

    // Add sort parameters
    if (sort) {
      endpoint += `&sort=${sort},${direction || 'ASC'}`;
    }

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
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
): Promise<PaginatedProjetos> => {
  try {
    let url = `/projetos/date-range?page=${page}&size=${size}`;
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
    if (sort) {
      url += `&sort=${sort},${direction || 'ASC'}`;
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
    coordenadorId?: number; // Add this new filter
    propostaStartDate?: string; // Add this new filter
    propostaEndDate?: string; // Add this new filter
    adjudicacaoStartDate?: string; // Add this new filter
    adjudicacaoEndDate?: string; // Add this new filter
  },
  page: number = 0,
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
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

    // Add new filters
    if (filters.coordenadorId) {
      url += `&coordenadorId=${filters.coordenadorId}`;
    }
    if (filters.propostaStartDate) {
      url += `&propostaStartDate=${filters.propostaStartDate}`;
    }
    if (filters.propostaEndDate) {
      url += `&propostaEndDate=${filters.propostaEndDate}`;
    }
    if (filters.adjudicacaoStartDate) {
      url += `&adjudicacaoStartDate=${filters.adjudicacaoStartDate}`;
    }
    if (filters.adjudicacaoEndDate) {
      url += `&adjudicacaoEndDate=${filters.adjudicacaoEndDate}`;
    }

    // Add sort parameters
    if (sort) {
      url += `&sort=${sort},${direction || 'ASC'}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching projetos with filters:', error);
    throw error;
  }
};

export const getExternosByProjetoIdAPI = async (projetoId: number) => {
  try {
    console.log(`Fetching externos for projeto ID: ${projetoId}`);
    const response = await axios.get(`/projetos/${projetoId}/externos`);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching externos for projeto ID:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error details:', error.response.data);
    }
    return [];
  }
};

export const getProjetoDetailsAPI = async (id: number): Promise<Projeto> => {
  try {
    const response = await axios.get<Projeto>(`/projetos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project details with id ${id}:`, error);
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
    console.log(`[API] Iniciando atualização de status da tarefa ${tarefaId} para "${newStatus}"`);
    
    // Registrar payload sendo enviado
    const payload = { status: newStatus };
    console.log(`[API] Payload da requisição:`, JSON.stringify(payload));
    
    // Registrar URL completa sendo chamada
    const url = `/tarefas/${tarefaId}/status`;
    console.log(`[API] Enviando requisição PUT para: ${url}`);
    
    // Fazer a requisição e registrar o momento
    const startTime = new Date().getTime();
    const response = await axios.put<TarefaWithUsersDTO>(url, payload);
    const endTime = new Date().getTime();
    
    console.log(`[API] Resposta recebida em ${endTime - startTime}ms - Status: ${response.status}`);
    console.log(`[API] Dados da resposta:`, JSON.stringify(response.data));
    
    // Verificar se a tarefa tem usuários e projeto
    if (response.data) {
      console.log(`[API] Tarefa atualizada - ID: ${response.data.id}, Status: ${response.data.status}`);
      if (response.data.users) {
        console.log(`[API] Usuários associados: ${response.data.users.length}`);
      } else {
        console.log(`[API] Aviso: Tarefa não tem usuários associados`);
      }
      
      if (response.data.projeto) {
        console.log(`[API] Projeto associado - ID: ${response.data.projeto.id}, Nome: "${response.data.projeto.designacao}"`);
      } else {
        console.log(`[API] Aviso: Tarefa não tem projeto associado`);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`[API] ERRO ao atualizar status da tarefa ${tarefaId}:`, error);
    
    // Registrar detalhes específicos do erro Axios
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`[API] Status do erro: ${error.response.status}`);
        console.error(`[API] Dados do erro: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('[API] Requisição feita mas sem resposta');
      } else {
        console.error(`[API] Erro na configuração da requisição: ${error.message}`);
      }
    }
    
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

export const getTarefasFilteredAPI = async (params: {
  page: number;
  size: number;
  sort: string;
  direction?: string;
  descricao?: string;
  status?: string;
  projeto?: string; // This will be the project ID
  dateField?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    console.log('API - getTarefasFilteredAPI called with params:', params);

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('size', params.size.toString());
    queryParams.append('sort', params.sort);

    if (params.direction) {
      queryParams.append('direction', params.direction);
    } else {
      queryParams.append('direction', 'ASC');
    }

    if (params.descricao) {
      queryParams.append('descricao', params.descricao);
      console.log('API - Adding descricao filter:', params.descricao);
    }

    if (params.status) {
      queryParams.append('status', params.status);
      console.log('API - Adding status filter:', params.status);
    }

    // FIXED: Use 'projetoId' parameter to match backend expectation
    if (params.projeto) {
      queryParams.append('projetoId', params.projeto);
      console.log('API - Adding projetoId filter:', params.projeto);
    }

    // Add date filter params if they exist
    if (params.dateField && (params.startDate || params.endDate)) {
      queryParams.append('dateField', params.dateField);
      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      console.log('API - Adding date filters:', {
        dateField: params.dateField,
        startDate: params.startDate,
        endDate: params.endDate,
      });
    }

    const finalUrl = `/tarefas/filter?${queryParams.toString()}`;
    console.log('API - Final URL:', finalUrl);
    console.log('API - Query params string:', queryParams.toString());

    // Make the API call
    const response = await axios.get(finalUrl);
    console.log('API - Response status:', response.status);
    console.log('API - Response data:', response.data);
    console.log(
      'API - Number of tarefas returned:',
      response.data?.content?.length || 0
    );

    return response.data;
  } catch (error) {
    console.error('API - Error fetching filtered tarefas:', error);
    if (axios.isAxiosError(error)) {
      console.error('API - Error response:', error.response?.data);
      console.error('API - Error status:', error.response?.status);
    }
    throw error;
  }
};

/**
 * Fetch tarefas for a specific externo with full projeto information
 * @param externoId The ID of the externo to fetch tarefas for
 * @param page Page number for pagination
 * @param size Items per page
 */
export const getTarefasByExternoIdWithFullProjetoAPI = async (
  externoId: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedTarefas> => {
  try {
    console.log(`Fetching tarefas for externo with ID ${externoId}`);
    const response = await axios.get(`/tarefas/externo/${externoId}/full`, {
      params: { page, size },
    });

    console.log('Tarefas by externo response:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching tarefas for externo with ID ${externoId}:`,
      error
    );
    // Return empty paginated result on error
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size,
      number: page,
    };
  }
};
