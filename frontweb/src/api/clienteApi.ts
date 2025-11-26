import axios from './apiConfig';
import {
  ClienteDTO,
  ClienteInsertDTO,
  ClienteUpdateDTO,
  ClienteWithProjetosAndUsersDTO,
  ClienteWithProjetosDTO,
  PaginatedClientes,
} from '../types/cliente';
import { Projeto } from '../types/projeto';

// Get all clientes without pagination
export const getAllClientesAPI = async (): Promise<ClienteDTO[]> => {
  const response = await axios.get('/clientes');
  return response.data;
};

// Get all clientes with pagination and sorting
export const getClientesPagedAPI = async (
  page: number = 0,
  size: number = 10,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<PaginatedClientes> => {
  const params: any = {
    page,
    size,
  };

  if (sortField) {
    params.sort = `${sortField},${sortDirection || 'asc'}`;
  }

  const response = await axios.get('/clientes/paged', { params });
  return response.data;
};

// Get all clientes with their associated projetos
export const getAllClientesWithProjetosAPI = async (): Promise<
  ClienteWithProjetosDTO[]
> => {
  const response = await axios.get('/clientes/with-projetos');
  return response.data;
};

// Get cliente by ID
export const getClienteByIdAPI = async (id: number): Promise<ClienteDTO> => {
  try {
    const response = await axios.get(`/clientes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cliente:', error);
    throw error;
  }
};

// Get cliente with projetos by ID
export const getClienteWithProjetosByIdAPI = async (
  id: number
): Promise<ClienteWithProjetosDTO> => {
  try {
    const response = await axios.get(`/clientes/${id}/with-projetos`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cliente with projetos:', error);
    throw error;
  }
};

// Get projetos with users by cliente ID
export const getProjetosWithUsersByClienteIdAPI = async (
  clienteId: number
): Promise<Projeto[]> => {
  try {
    const response = await axios.get(
      `/clientes/${clienteId}/projetos-with-users`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching projetos with users for cliente with id ${clienteId}:`,
      error
    );
    throw error;
  }
};

// Get cliente with projetos and users by ID
export const getClienteWithProjetosAndUsersAPI = async (
  clienteId: number
): Promise<ClienteWithProjetosAndUsersDTO> => {
  try {
    const response = await axios.get(
      `/clientes/${clienteId}/with-projetos-and-users`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching cliente with projetos and users for id ${clienteId}:`,
      error
    );
    throw error;
  }
};

// Get projetos by cliente ID
export const getProjetosByClienteIdAPI = async (
  clienteId: number
): Promise<Projeto[]> => {
  try {
    const response = await axios.get(`/clientes/${clienteId}/projetos`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching projetos for cliente with id ${clienteId}:`,
      error
    );
    throw error;
  }
};

// Create a new cliente
export const createClienteAPI = async (
  clienteData: ClienteInsertDTO
): Promise<ClienteDTO> => {
  try {
    const response = await axios.post('/clientes', clienteData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error creating cliente - Status:', error.response.status);
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

// Create a new cliente with associated projetos
export const createClienteWithProjetosAPI = async (
  clienteData: ClienteWithProjetosDTO
): Promise<ClienteWithProjetosDTO> => {
  try {
    const response = await axios.post('/clientes/with-projetos', clienteData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        'Error creating cliente with projetos - Status:',
        error.response.status
      );
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

// Update an existing cliente
export const updateClienteAPI = async (
  id: number,
  cliente: ClienteUpdateDTO
): Promise<ClienteDTO> => {
  try {
    const response = await axios.put(`/clientes/${id}`, cliente);
    return response.data;
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

// Update an existing cliente with projetos
export const updateClienteWithProjetosAPI = async (
  id: number,
  cliente: ClienteWithProjetosDTO
): Promise<ClienteWithProjetosDTO> => {
  try {
    const response = await axios.put(`/clientes/${id}/with-projetos`, cliente);
    return response.data;
  } catch (error) {
    console.error('Error updating cliente with projetos:', error);
    throw error;
  }
};

// Delete a cliente
export const deleteClienteAPI = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/clientes/${id}`);
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw error;
  }
};

// Search clientes
export const searchClientesAPI = async (
  query: string
): Promise<ClienteDTO[]> => {
  try {
    const response = await axios.get(`/clientes/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching clientes:', error);
    throw error;
  }
};

// Associate a projeto with a cliente
export const associateProjetoWithClienteAPI = async (
  clienteId: number,
  projetoId: number
): Promise<ClienteWithProjetosDTO> => {
  try {
    const response = await axios.post(
      `/clientes/${clienteId}/projetos/${projetoId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error associating projeto with cliente:', error);
    throw error;
  }
};

// Disassociate a projeto from a cliente
export const disassociateProjetoFromClienteAPI = async (
  clienteId: number,
  projetoId: number
): Promise<void> => {
  try {
    await axios.delete(`/clientes/${clienteId}/projetos/${projetoId}`);
  } catch (error) {
    console.error('Error disassociating projeto from cliente:', error);
    throw error;
  }
};

// New API functions for managing collections

// Add a responsible to a client
export const addResponsavelAPI = async (
  clienteId: number,
  responsavel: string
): Promise<ClienteDTO> => {
  try {
    const response = await axios.post(
      `/clientes/${clienteId}/responsaveis`,
      responsavel,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding responsavel to cliente:', error);
    throw error;
  }
};

// Remove a responsible from a client
export const removeResponsavelAPI = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO> => {
  try {
    const response = await axios.delete(
      `/clientes/${clienteId}/responsaveis/${index}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing responsavel from cliente:', error);
    throw error;
  }
};

// Add a contact to a client
export const addContactoAPI = async (
  clienteId: number,
  contacto: string
): Promise<ClienteDTO> => {
  try {
    const response = await axios.post(
      `/clientes/${clienteId}/contactos`,
      contacto,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding contacto to cliente:', error);
    throw error;
  }
};

// Remove a contact from a client
export const removeContactoAPI = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO> => {
  try {
    const response = await axios.delete(
      `/clientes/${clienteId}/contactos/${index}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing contacto from cliente:', error);
    throw error;
  }
};

// Add an email to a client
export const addEmailAPI = async (
  clienteId: number,
  email: string
): Promise<ClienteDTO> => {
  try {
    const response = await axios.post(`/clientes/${clienteId}/emails`, email, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding email to cliente:', error);
    throw error;
  }
};

// Remove an email from a client
export const removeEmailAPI = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO> => {
  try {
    const response = await axios.delete(
      `/clientes/${clienteId}/emails/${index}`
    );
    return response.data;
  } catch (error) {
    console.error('Error removing email from cliente:', error);
    throw error;
  }
};
