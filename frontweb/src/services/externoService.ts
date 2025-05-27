import {
  ExternoDTO,
  ExternoInsertDTO,
  ExternoUpdateDTO,
  ExternoWithProjetosDTO,
  ExternoWithTarefasDTO,
  PaginatedExternos,
} from '../types/externo';
import {
  createExternoAPI,
  deleteExternoAPI,
  getAllExternosAPI,
  getExternoByIdAPI,
  getExternoWithProjetosByIdAPI,
  getExternoWithTarefasByIdAPI,
  getExternosAPI,
  getExternosWithFiltersAPI,
  getTarefasByExternoIdAPI,
  hardDeleteExternoAPI,
  searchExternosAPI,
  updateExternoAPI,
} from '../api/externoApi';
import { Tarefa } from '../types/tarefa';

// Get all externos with pagination
export const getExternos = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedExternos> => {
  try {
    return await getExternosAPI(page, size);
  } catch (error) {
    console.error('Error in externo service:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};

// Get all externos without pagination
export const getAllExternos = async (): Promise<ExternoDTO[]> => {
  try {
    return await getAllExternosAPI();
  } catch (error) {
    console.error('Error in externo service:', error);
    return [];
  }
};

// Get externo by ID
export const getExternoById = async (
  id: number
): Promise<ExternoDTO | null> => {
  try {
    return await getExternoByIdAPI(id);
  } catch (error) {
    console.error(`Error fetching externo with id ${id}:`, error);
    return null;
  }
};

// Get externo with projetos by ID
export const getExternoWithProjetosById = async (
  id: number
): Promise<ExternoWithProjetosDTO | null> => {
  try {
    return await getExternoWithProjetosByIdAPI(id);
  } catch (error) {
    console.error(`Error fetching externo with projetos with id ${id}:`, error);
    return null;
  }
};

// Get externo with tarefas by ID
export const getExternoWithTarefasById = async (
  id: number
): Promise<ExternoWithTarefasDTO | null> => {
  try {
    return await getExternoWithTarefasByIdAPI(id);
  } catch (error) {
    console.error(`Error fetching externo with tarefas with id ${id}:`, error);
    return null;
  }
};

// Get tarefas by externo ID
export const getTarefasByExternoId = async (
  externoId: number
): Promise<Tarefa[]> => {
  try {
    return await getTarefasByExternoIdAPI(externoId);
  } catch (error) {
    console.error(
      `Error fetching tarefas for externo with id ${externoId}:`,
      error
    );
    return [];
  }
};

// Create a new externo
export const createExterno = async (
  externo: ExternoInsertDTO
): Promise<ExternoDTO | null> => {
  try {
    return await createExternoAPI(externo);
  } catch (error) {
    console.error('Error creating externo:', error);
    return null;
  }
};

// Update an existing externo
export const updateExterno = async (
  id: number,
  externo: ExternoUpdateDTO
): Promise<ExternoDTO | null> => {
  try {
    return await updateExternoAPI(id, externo);
  } catch (error) {
    console.error(`Error updating externo with id ${id}:`, error);
    return null;
  }
};

// Delete an externo (soft delete)
export const deleteExterno = async (id: number): Promise<boolean> => {
  try {
    await deleteExternoAPI(id);
    return true;
  } catch (error) {
    console.error(`Error deleting externo with id ${id}:`, error);
    return false;
  }
};

// Hard delete an externo
export const hardDeleteExterno = async (id: number): Promise<boolean> => {
  try {
    await hardDeleteExternoAPI(id);
    return true;
  } catch (error) {
    console.error(`Error hard deleting externo with id ${id}:`, error);
    return false;
  }
};

// Search externos
export const searchExternos = async (query: string): Promise<ExternoDTO[]> => {
  try {
    return await searchExternosAPI(query);
  } catch (error) {
    console.error('Error searching externos:', error);
    return [];
  }
};

// Get externos with filters
export const getExternosWithFilters = async (
  filters: {
    name?: string;
    email?: string;
    faseProjeto?: string;
    especialidade?: string;
  },
  page: number = 0,
  size: number = 10
): Promise<PaginatedExternos> => {
  try {
    return await getExternosWithFiltersAPI(filters, page, size);
  } catch (error) {
    console.error('Error fetching externos with filters:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};
