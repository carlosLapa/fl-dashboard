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
  return {
    designacao: filters.designacao || undefined,
    entidade: filters.entidade || undefined,
    prioridade: filters.prioridade || undefined,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    // Add the new filter fields
    coordenadorId: filters.coordenadorId || undefined,
    propostaStartDate: filters.propostaStartDate || undefined,
    propostaEndDate: filters.propostaEndDate || undefined,
    adjudicacaoStartDate: filters.adjudicacaoStartDate || undefined,
    adjudicacaoEndDate: filters.adjudicacaoEndDate || undefined,
  };
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
    const projetoData = await getProjetoWithUsersAndTarefasAPI(id);
    // Perform any necessary data treatment here
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

export const getProjetosByDateRange = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
) => {
  try {
    const response = await getProjetosByDateRangeAPI(
      startDate,
      endDate,
      page,
      size,
      sort,
      direction
    );
    return response;
  } catch (error) {
    console.error('Error fetching projetos by date range:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};

// Updated to use the FilterState interface and the buildApiFilters helper
export const getProjetosWithFilters = async (
  filters: FilterState,
  page: number = 0,
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
) => {
  try {
    // Use our helper function to build API-compatible filters
    const apiFilters = buildApiFilters(filters);

    // Log the filters being sent to the API
    console.log('Sending filters to API:', apiFilters);

    const response = await getProjetosWithFiltersAPI(
      apiFilters,
      page,
      size,
      sort,
      direction
    );
    return response;
  } catch (error) {
    console.error('Error fetching projetos with filters:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};
