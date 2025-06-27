import {
  ClienteDTO,
  ClienteWithProjetosDTO,
  PaginatedClientes,
  ClienteInsertDTO,
  ClienteUpdateDTO,
} from '../types/cliente';
import {
  getAllClientesAPI,
  getClientesPagedAPI,
  getAllClientesWithProjetosAPI,
  getClienteByIdAPI,
  getClienteWithProjetosByIdAPI,
  getProjetosByClienteIdAPI,
  createClienteAPI,
  createClienteWithProjetosAPI,
  updateClienteAPI,
  updateClienteWithProjetosAPI,
  deleteClienteAPI,
  searchClientesAPI,
  associateProjetoWithClienteAPI,
  disassociateProjetoFromClienteAPI,
  addResponsavelAPI,
  removeResponsavelAPI,
  addContactoAPI,
  removeContactoAPI,
  addEmailAPI,
  removeEmailAPI,
} from '../api/clienteApi';
import { Projeto } from '../types/projeto';

// Get all clientes without pagination
export const getAllClientes = async (): Promise<ClienteDTO[]> => {
  try {
    return await getAllClientesAPI();
  } catch (error) {
    console.error('Error in cliente service:', error);
    return [];
  }
};

// Get all clientes with pagination
export const getClientesPaged = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedClientes> => {
  try {
    return await getClientesPagedAPI(page, size);
  } catch (error) {
    console.error('Error in cliente service:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        offset: page * size,
        paged: true,
        unpaged: false,
      },
      last: true,
      first: true,
      empty: true,
      numberOfElements: 0,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
    };
  }
};

// Get all clientes with their associated projetos
export const getAllClientesWithProjetos = async (): Promise<
  ClienteWithProjetosDTO[]
> => {
  try {
    return await getAllClientesWithProjetosAPI();
  } catch (error) {
    console.error('Error in cliente service:', error);
    return [];
  }
};

// Get cliente by ID
export const getClienteById = async (
  id: number
): Promise<ClienteDTO | null> => {
  try {
    return await getClienteByIdAPI(id);
  } catch (error) {
    console.error(`Error fetching cliente with id ${id}:`, error);
    return null;
  }
};

// Get cliente with projetos by ID
export const getClienteWithProjetosById = async (
  id: number
): Promise<ClienteWithProjetosDTO | null> => {
  try {
    return await getClienteWithProjetosByIdAPI(id);
  } catch (error) {
    console.error(`Error fetching cliente with projetos with id ${id}:`, error);
    return null;
  }
};

// Get projetos by cliente ID
export const getProjetosByClienteId = async (
  clienteId: number
): Promise<Projeto[]> => {
  try {
    return await getProjetosByClienteIdAPI(clienteId);
  } catch (error) {
    console.error(
      `Error fetching projetos for cliente with id ${clienteId}:`,
      error
    );
    return [];
  }
};

// Create a new cliente
export const createCliente = async (
  cliente: ClienteInsertDTO
): Promise<ClienteDTO | null> => {
  try {
    return await createClienteAPI(cliente);
  } catch (error) {
    console.error('Error creating cliente:', error);
    return null;
  }
};

// Create a new cliente with associated projetos
export const createClienteWithProjetos = async (
  cliente: ClienteWithProjetosDTO
): Promise<ClienteWithProjetosDTO | null> => {
  try {
    return await createClienteWithProjetosAPI(cliente);
  } catch (error) {
    console.error('Error creating cliente with projetos:', error);
    return null;
  }
};

// Update an existing cliente
export const updateCliente = async (
  id: number,
  cliente: ClienteUpdateDTO
): Promise<ClienteDTO | null> => {
  try {
    return await updateClienteAPI(id, cliente);
  } catch (error) {
    console.error(`Error updating cliente with id ${id}:`, error);
    return null;
  }
};

// Update an existing cliente with projetos
export const updateClienteWithProjetos = async (
  id: number,
  cliente: ClienteWithProjetosDTO
): Promise<ClienteWithProjetosDTO | null> => {
  try {
    return await updateClienteWithProjetosAPI(id, cliente);
  } catch (error) {
    console.error(`Error updating cliente with projetos with id ${id}:`, error);
    return null;
  }
};

// Delete a cliente
export const deleteCliente = async (id: number): Promise<boolean> => {
  try {
    await deleteClienteAPI(id);
    return true;
  } catch (error) {
    console.error(`Error deleting cliente with id ${id}:`, error);
    return false;
  }
};

// Search clientes
export const searchClientes = async (query: string): Promise<ClienteDTO[]> => {
  try {
    return await searchClientesAPI(query);
  } catch (error) {
    console.error('Error searching clientes:', error);
    return [];
  }
};

// Associate a projeto with a cliente
export const associateProjetoWithCliente = async (
  clienteId: number,
  projetoId: number
): Promise<ClienteWithProjetosDTO | null> => {
  try {
    return await associateProjetoWithClienteAPI(clienteId, projetoId);
  } catch (error) {
    console.error(
      `Error associating projeto ${projetoId} with cliente ${clienteId}:`,
      error
    );
    return null;
  }
};

// Disassociate a projeto from a cliente
export const disassociateProjetoFromCliente = async (
  clienteId: number,
  projetoId: number
): Promise<boolean> => {
  try {
    await disassociateProjetoFromClienteAPI(clienteId, projetoId);
    return true;
  } catch (error) {
    console.error(
      `Error disassociating projeto ${projetoId} from cliente ${clienteId}:`,
      error
    );
    return false;
  }
};

// New service functions for managing collections

// Add a responsible to a client
export const addResponsavel = async (
  clienteId: number,
  responsavel: string
): Promise<ClienteDTO | null> => {
  try {
    return await addResponsavelAPI(clienteId, responsavel);
  } catch (error) {
    console.error(`Error adding responsavel to cliente ${clienteId}:`, error);
    return null;
  }
};

// Remove a responsible from a client
export const removeResponsavel = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO | null> => {
  try {
    return await removeResponsavelAPI(clienteId, index);
  } catch (error) {
    console.error(
      `Error removing responsavel from cliente ${clienteId}:`,
      error
    );
    return null;
  }
};

// Add a contact to a client
export const addContacto = async (
  clienteId: number,
  contacto: string
): Promise<ClienteDTO | null> => {
  try {
    return await addContactoAPI(clienteId, contacto);
  } catch (error) {
    console.error(`Error adding contacto to cliente ${clienteId}:`, error);
    return null;
  }
};

// Remove a contact from a client
export const removeContacto = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO | null> => {
  try {
    return await removeContactoAPI(clienteId, index);
  } catch (error) {
    console.error(`Error removing contacto from cliente ${clienteId}:`, error);
    return null;
  }
};

// Add an email to a client
export const addEmail = async (
  clienteId: number,
  email: string
): Promise<ClienteDTO | null> => {
  try {
    return await addEmailAPI(clienteId, email);
  } catch (error) {
    console.error(`Error adding email to cliente ${clienteId}:`, error);
    return null;
  }
};

// Remove an email from a client
export const removeEmail = async (
  clienteId: number,
  index: number
): Promise<ClienteDTO | null> => {
  try {
    return await removeEmailAPI(clienteId, index);
  } catch (error) {
    console.error(`Error removing email from cliente ${clienteId}:`, error);
    return null;
  }
};
