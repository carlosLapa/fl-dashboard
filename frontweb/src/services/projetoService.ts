import {
  PaginatedProjetos,
  Projeto,
  ProjetoFormData,
  ProjetoWithUsersAndTarefasDTO,
} from '../types/projeto';
import {
  addProjetoAPI,
  getProjetosAPI,
  getProjetosByDateRangeAPI,
  getProjetosWithFiltersAPI,
  getProjetoWithUsersAndTarefasAPI,
} from '../api/requestsApi';
import { ProjetoFilterState } from '../types/filters';
import { hasPermission } from '../utils/hasPermission';
import axios from 'axios';

// Use the ProjetoFilterState type from our filters.ts
export type FilterState = ProjetoFilterState;

// Function to build API-compatible filter object
export const buildApiFilters = (filters: FilterState) => {
  // Para debug
  console.log('Building API filters from:', filters);
  
  // Função auxiliar para tratar strings vazias vs valores reais
  const valueOrUndefined = (value: string | undefined | null): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (value.trim() === '') return undefined;
    return value;
  };

  // Função auxiliar para tratar números que podem ser undefined ou zero
  const numberOrUndefined = (value: number | undefined | null): number | undefined => {
    return (value !== undefined && value !== null) ? value : undefined;
  };
  
  const apiFilters = {
    designacao: valueOrUndefined(filters.designacao),
    // Tratamento específico para clienteId - usar numberOrUndefined para evitar valores zero
    clienteId: numberOrUndefined(filters.clienteId),
    // Se filters.cliente for string vazia, não será enviado como parâmetro
    clienteName: valueOrUndefined(filters.cliente),
    prioridade: valueOrUndefined(filters.prioridade),
    status: filters.status !== 'ALL' ? filters.status : undefined,
    startDate: valueOrUndefined(filters.startDate),
    endDate: valueOrUndefined(filters.endDate),
    coordenadorId: numberOrUndefined(filters.coordenadorId),
    propostaStartDate: valueOrUndefined(filters.propostaStartDate),
    propostaEndDate: valueOrUndefined(filters.propostaEndDate),
    adjudicacaoStartDate: valueOrUndefined(filters.adjudicacaoStartDate),
    adjudicacaoEndDate: valueOrUndefined(filters.adjudicacaoEndDate),
    tipo: filters.tipo !== 'ALL' ? filters.tipo : undefined,
  };
  
  // Remove propriedades undefined para maior clareza nos logs
  const cleanedFilters = Object.fromEntries(
    Object.entries(apiFilters).filter(([_, value]) => value !== undefined)
  );
  
  // Para debug mais detalhado
  console.log('API filters built:', cleanedFilters);
  console.log('clienteId (original):', filters.clienteId, 'type:', typeof filters.clienteId);
  console.log('clienteId (processed):', apiFilters.clienteId, 'type:', typeof apiFilters.clienteId);
  console.log('clienteName (original):', filters.cliente, 'type:', typeof filters.cliente);
  console.log('clienteName (processed):', apiFilters.clienteName, 'type:', typeof apiFilters.clienteName);
  
  return apiFilters;
};

export const getProjetos = async (
  page: number = 0,
  pageSize: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
): Promise<PaginatedProjetos> => {
  try {
    console.log('Fetching all projetos');
    const response = await getProjetosAPI(page, pageSize, sort, direction);
    return {
      content: response.content.map((projeto: Projeto) => ({
        ...projeto,
        users: projeto.users || [],
      })),
      totalPages: response.totalPages,
      totalElements: response.totalElements,
      size: response.size,
      number: response.number,
    };
  } catch (error) {
    console.error('Erro ao carregar os projetos:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: pageSize,
      number: page,
    };
  }
};

// permission-aware function that determines if we can create projects
export const canCreateProjeto = (): boolean => {
  return hasPermission('CREATE_PROJECT');
};

export const addProjeto = async (data: ProjetoFormData): Promise<void> => {
  try {
    if (!canCreateProjeto()) {
      throw new Error("You don't have permission to create projects");
    }
    await addProjetoAPI(data);
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

// For the kanban board
export const getProjetoWithUsersAndTarefas = async (
  id: number
): Promise<ProjetoWithUsersAndTarefasDTO> => {
  try {
    console.log(`Buscando projeto ${id} com tarefas e usuários`);
    const projetoData = await getProjetoWithUsersAndTarefasAPI(id);

    // Garantir que o projeto tenha sempre um array de tarefas, mesmo que vazio
    if (!projetoData.tarefas) {
      console.log(
        `Projeto ${id} não possui o campo tarefas. Inicializando como array vazio.`
      );
      projetoData.tarefas = [];
    } else if (!Array.isArray(projetoData.tarefas)) {
      console.warn(
        `Projeto ${id} tem campo tarefas que não é um array. Convertendo para array vazio.`
      );
      projetoData.tarefas = [];
    }

    // Garantir que o projeto tenha sempre um array de users, mesmo que vazio
    if (!projetoData.users) {
      projetoData.users = [];
    } else if (!Array.isArray(projetoData.users)) {
      projetoData.users = [];
    }

    console.log(
      `Projeto ${id} processado com sucesso. Tarefas: ${projetoData.tarefas.length}`
    );
    return projetoData;
  } catch (error) {
    // Error is already handled by the interceptor in apiConfig.ts
    console.error('Error fetching projeto with users and tarefas:', error);

    // Type guard to check if error is an Axios error
    if (axios.isAxiosError(error)) {
      // Now TypeScript knows this is an AxiosError
      if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para visualizar este projeto');
      } else if (error.response?.status === 404) {
        throw new Error('Projeto não encontrado ou foi removido');
      }
    }

    // For other errors, throw a generic message
    throw new Error('Erro ao carregar o projeto. Por favor, tente novamente.');
  }
};

/**
 * Retrieves all projects with minimal pagination (large page size)
 * This is primarily used for dropdowns and selectors
 * @returns An array of projects for selection purposes
 */
export const getAllProjetos = async (): Promise<PaginatedProjetos> => {
  try {
    // Use a large page size to get all projetos in a single request
    const response = await getProjetosAPI(0, 1000);
    console.log('getAllProjetos - Retrieved projects:', response.content.length);
    return response;
  } catch (error) {
    console.error('Error in getAllProjetos:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: 0,
      number: 0,
    };
  }
};

export const fetchProjetosByDateRange = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
) => {
  try {
    const response = await getProjetosByDateRangeAPI(
      startDate,
      endDate,
      page,
      size
    );
    return response;
  } catch (error) {
    console.error('Error fetching projetos by date range:', error);
    throw error;
  }
};

// Updated to use the FilterState interface and the buildApiFilters helper
export const fetchProjetosWithFilters = async (
  filters: FilterState,
  page: number = 0,
  size: number = 10,
  sort: string = 'id',
  direction: 'ASC' | 'DESC' = 'ASC'
) => {
  try {
    console.log('fetchProjetosWithFilters - Original filters:', JSON.stringify(filters, null, 2));
    
    const apiFilters = buildApiFilters(filters);
    console.log('fetchProjetosWithFilters - Processed apiFilters:', JSON.stringify(apiFilters, null, 2));

    // Combine sort and direction into a single parameter
    const sortParam = `${sort},${direction.toLowerCase()}`;
    console.log('fetchProjetosWithFilters - Sort parameter:', sortParam);

    const response = await getProjetosWithFiltersAPI(
      apiFilters,
      page,
      size,
      sortParam // Pass as a single formatted sort parameter
    );
    
    console.log('fetchProjetosWithFilters - API Response:', response.status);
    
    if (response.data && response.data.content) {
      console.log('fetchProjetosWithFilters - Found items:', response.data.content.length);
      
      // Verificar se está retornando os dados corretamente
      if (response.data.content.length > 0) {
        console.log('fetchProjetosWithFilters - Primeiro projeto:', response.data.content[0].id);
        
        // Incluir mais dados para debug
        if (apiFilters.clienteId) {
          console.log('fetchProjetosWithFilters - Filtrou por clienteId:', apiFilters.clienteId);
          console.log('fetchProjetosWithFilters - Cliente do primeiro projeto:', 
            response.data.content[0].cliente?.name || 'N/A',
            'ID:', response.data.content[0].cliente?.id || 'N/A');
        }
      }
    } else {
      console.warn('fetchProjetosWithFilters - Resposta sem conteúdo válido:', response.data);
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching projetos with filters:', error);
    // Mais detalhes sobre erros do Axios
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
    }
    throw error;
  }
};

/**
 * Fetch projetos with filters for the active cliente
 * @param clienteId The ID of the cliente to filter by
 * @param filters Additional filters to apply
 * @param page Page number
 * @param size Items per page
 * @param sort Field to sort by
 * @param direction Sort direction
 * @returns Response from API
 */
export const fetchProjetosForCliente = async (
  clienteId: number,
  filters: FilterState,
  page: number = 0,
  size: number = 10,
  sort: string = 'id',
  direction: 'ASC' | 'DESC' = 'ASC'
) => {
  try {
    // Include clienteId in the filters
    const clienteFilters = {
      ...filters,
      clienteId,
    };

    const apiFilters = buildApiFilters(clienteFilters);

    // Combine sort and direction
    const sortParam = `${sort},${direction.toLowerCase()}`;

    const response = await getProjetosWithFiltersAPI(
      apiFilters,
      page,
      size,
      sortParam // Pass as a single formatted sort parameter
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching projetos for cliente ${clienteId}:`, error);
    throw error;
  }
};

export const processExternoIds = (externoIds: number[]): number[] => {
  if (!externoIds || externoIds.length === 0) return [];

  // Usar Set para garantir valores únicos
  const uniqueIds = [...new Set(externoIds)];

  // Se houve remoção de duplicações, mostrar alerta
  if (uniqueIds.length < externoIds.length) {
    console.warn(
      'Colaboradores externos duplicados foram removidos da seleção'
    );
  }

  return uniqueIds;
};

export const isExternoAlreadySelected = (
  selectedExternos: number[],
  externoId: number
): boolean => {
  return selectedExternos.includes(externoId);
};
