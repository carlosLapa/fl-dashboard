import axios from './apiConfig';
import {
  ExternoDTO,
  ExternoInsertDTO,
  ExternoUpdateDTO,
  ExternoWithProjetosDTO,
  ExternoWithTarefasDTO,
  PaginatedExternos,
} from '../types/externo';
import { Tarefa } from '../types/tarefa';

// Get all externos with pagination
export const getExternosAPI = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedExternos> => {
  const response = await axios.get(`/externos/paged?page=${page}&size=${size}`);
  return response.data;
};

// Get all externos without pagination
export const getAllExternosAPI = async (): Promise<ExternoDTO[]> => {
  const response = await axios.get('/externos');
  return response.data;
};

// Get externo by ID
export const getExternoByIdAPI = async (id: number): Promise<ExternoDTO> => {
  try {
    const response = await axios.get(`/externos/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching externo:', error);
    throw error;
  }
};

// Get externo with projetos by ID
export const getExternoWithProjetosByIdAPI = async (
  id: number
): Promise<ExternoWithProjetosDTO> => {
  try {
    const response = await axios.get(`/externos/${id}/with-projetos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching externo with projetos:', error);
    throw error;
  }
};

// Get externo with tarefas by ID
export const getExternoWithTarefasByIdAPI = async (
  id: number
): Promise<ExternoWithTarefasDTO> => {
  try {
    const response = await axios.get(`/externos/${id}/with-tarefas`);
    return response.data;
  } catch (error) {
    console.error('Error fetching externo with tarefas:', error);
    throw error;
  }
};

// Get tarefas by externo ID
export const getTarefasByExternoIdAPI = async (
  externoId: number
): Promise<Tarefa[]> => {
  try {
    const response = await axios.get(`/externos/${externoId}/tarefas`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching tarefas for externo with id ${externoId}:`,
      error
    );
    throw error;
  }
};

// Create a new externo
export const createExternoAPI = async (
  externoData: ExternoInsertDTO
): Promise<ExternoDTO> => {
  try {
    const response = await axios.post('/externos', externoData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error creating externo - Status:', error.response.status);
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

// Update an existing externo
export const updateExternoAPI = async (
  id: number,
  externo: ExternoUpdateDTO
): Promise<ExternoDTO> => {
  try {
    const response = await axios.put(`/externos/${id}`, externo);
    return response.data;
  } catch (error) {
    console.error('Error updating externo:', error);
    throw error;
  }
};

// Delete an externo (soft delete)
export const deleteExternoAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/externos/${id}`);
  } catch (error) {
    console.error('Error deleting externo:', error);
    throw error;
  }
};

// Hard delete an externo
export const hardDeleteExternoAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/externos/${id}/hard`);
  } catch (error) {
    console.error('Error hard deleting externo:', error);
    throw error;
  }
};

// Search externos
export const searchExternosAPI = async (
  query: string
): Promise<ExternoDTO[]> => {
  try {
    const response = await axios.get(`/externos/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching externos:', error);
    throw error;
  }
};

// Get externos with filters
export const getExternosWithFiltersAPI = async (
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
    let url = `/externos/filter?page=${page}&size=${size}`;

    // Add all filters to the URL
    if (filters.name) {
      url += `&name=${encodeURIComponent(filters.name)}`;
    }
    if (filters.email) {
      url += `&email=${encodeURIComponent(filters.email)}`;
    }
    if (filters.faseProjeto) {
      url += `&faseProjeto=${filters.faseProjeto}`;
    }
    if (filters.especialidade) {
      url += `&especialidade=${filters.especialidade}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching externos with filters:', error);
    throw error;
  }
};
