import {
  Proposta,
  PropostaFormData,
  PaginatedPropostas,
} from '../types/proposta';
import {
  getPropostasAPI,
  getPropostaByIdAPI,
  getPropostaWithClientesAPI,
  addPropostaAPI,
  updatePropostaAPI,
  deletePropostaAPI,
  adjudicarPropostaAPI,
  converterParaProjetoAPI,
  updatePropostaStatusAPI,
} from '../api/propostaApi';
import axios from 'axios';
import { hasPermission } from '../utils/hasPermission';
import { Permission } from '../permissions/rolePermissions';

// Funções de permissão para Proposta
export const canCreateProposta = (): boolean => {
  return hasPermission(Permission.CREATE_PROPOSTA);
};

export const canEditProposta = (): boolean => {
  return hasPermission(Permission.EDIT_PROPOSTA);
};

export const canDeleteProposta = (): boolean => {
  return hasPermission(Permission.DELETE_PROPOSTA);
};

// Helper para construir filtros compatíveis com a API
export const buildApiFilters = (filters: any) => {
  return {
    designacao: filters.designacao || undefined,
    prioridade: filters.prioridade || undefined,
    status: filters.status !== 'ALL' ? filters.status : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    tipo: filters.tipo !== 'ALL' ? filters.tipo : undefined,
    // Adicione outros campos de filtro conforme necessário
  };
};

export const getPropostas = async (
  page: number = 0,
  size: number = 10,
  filters: any = {},
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<PaginatedPropostas> => {
  try {
    const apiFilters = buildApiFilters(filters);
    const response = await getPropostasAPI(
      page,
      size,
      apiFilters,
      sortField,
      sortDirection
    );
    return {
      content: response.content || [],
      totalPages: response.totalPages || 0,
      totalElements: response.totalElements || 0,
      size: response.size || size,
      number: response.number || page,
    };
  } catch (error) {
    console.error('Erro ao carregar as propostas:', error);
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
    };
  }
};

export const getPropostaById = async (id: number): Promise<Proposta | null> => {
  try {
    const proposta = await getPropostaByIdAPI(id);
    return proposta;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Proposta não encontrada ou foi removida');
      }
    }
    throw new Error('Erro ao carregar a proposta. Por favor, tente novamente.');
  }
};

export const getPropostaWithClientes = async (
  id: number
): Promise<Proposta | null> => {
  try {
    const proposta = await getPropostaWithClientesAPI(id);
    return proposta;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Proposta não encontrada ou foi removida');
      }
    }
    throw new Error(
      'Erro ao carregar os detalhes da proposta. Por favor, tente novamente.'
    );
  }
};

export const createProposta = async (
  data: PropostaFormData
): Promise<Proposta | null> => {
  try {
    if (!canCreateProposta()) {
      throw new Error('Você não tem permissão para criar propostas');
    }
    const proposta = await addPropostaAPI(data);
    return proposta;
  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    throw error;
  }
};

export const updateProposta = async (
  id: number,
  data: PropostaFormData
): Promise<Proposta | null> => {
  try {
    if (!canEditProposta()) {
      throw new Error('Você não tem permissão para editar propostas');
    }
    const proposta = await updatePropostaAPI(id, data);
    return proposta;
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error);
    throw error;
  }
};

export const deleteProposta = async (id: number): Promise<void> => {
  try {
    if (!canDeleteProposta()) {
      throw new Error('Você não tem permissão para excluir propostas');
    }
    await deletePropostaAPI(id);
  } catch (error) {
    console.error('Erro ao excluir proposta:', error);
    throw error;
  }
};

export const adjudicarProposta = async (id: number): Promise<any> => {
  try {
    const result = await adjudicarPropostaAPI(id);
    return result;
  } catch (error) {
    console.error('Erro ao adjudicar proposta:', error);
    throw error;
  }
};

export const converterParaProjeto = async (id: number): Promise<any> => {
  try {
    const result = await converterParaProjetoAPI(id);
    return result;
  } catch (error) {
    console.error('Erro ao converter proposta para projeto:', error);
    throw error;
  }
};

export const updatePropostaStatus = async (
  id: number,
  status: string
): Promise<Proposta | null> => {
  try {
    if (!canEditProposta()) {
      throw new Error('Você não tem permissão para editar propostas');
    }
    const proposta = await updatePropostaStatusAPI(id, status);
    return proposta;
  } catch (error) {
    console.error('Erro ao atualizar status da proposta:', error);
    throw error;
  }
};
