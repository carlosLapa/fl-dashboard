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

// Define the filter state interface to match what the component uses
export interface FilterState {
  designacao: string;
  entidade: string;
  prioridade: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const getProjetos = async (
  page: number = 0,
  pageSize: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
): Promise<PaginatedProjetos> => {
  try {
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

export const addProjeto = async (data: ProjetoFormData): Promise<void> => {
  try {
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
    console.error('Error in projeto service:', error);
    throw error;
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

// Updated to use the FilterState interface
export const getProjetosWithFilters = async (
  filters: FilterState,
  page: number = 0,
  size: number = 10,
  sort?: string,
  direction?: 'ASC' | 'DESC'
) => {
  try {
    // Convert our FilterState to the format expected by the API
    // The API expects undefined for empty values, not empty strings
    const apiFilters = {
      designacao: filters.designacao || undefined,
      entidade: filters.entidade || undefined,
      prioridade: filters.prioridade || undefined,
      status: filters.status !== 'ALL' ? filters.status : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };

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
