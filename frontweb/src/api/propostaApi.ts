import axios from './apiConfig';
import {
  Proposta,
  PropostaFormData,
  PaginatedPropostas,
} from '../types/proposta';
import { Projeto } from '../types/projeto';

// Funções de request HTTP para Proposta
export const getPropostasAPI = async (
  page = 0,
  size = 10,
  filters = {},
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<PaginatedPropostas> => {
  const params: any = {
    page,
    size,
    ...filters,
  };

  // Ignorar sorting por 'clientes' no backend (será feito client-side)
  if (sortField && sortField !== 'clientes') {
    params.sort = `${sortField},${sortDirection || 'asc'}`;
  }

  const response = await axios.get('/propostas', { params });
  return response.data;
};

export const getPropostaByIdAPI = async (id: number): Promise<Proposta> => {
  const response = await axios.get(`/propostas/${id}`);
  return response.data;
};

export const getPropostaWithClientesAPI = async (
  id: number
): Promise<Proposta> => {
  const response = await axios.get(`/propostas/${id}`);
  return response.data;
};

export const addPropostaAPI = async (
  data: PropostaFormData
): Promise<Proposta> => {
  const response = await axios.post('/propostas', data);
  return response.data;
};

export const updatePropostaAPI = async (
  id: number,
  data: PropostaFormData
): Promise<Proposta> => {
  const response = await axios.put(`/propostas/${id}`, data);
  return response.data;
};

export const deletePropostaAPI = async (id: number): Promise<void> => {
  await axios.delete(`/propostas/${id}`);
};

export const adjudicarPropostaAPI = async (id: number): Promise<any> => {
  const response = await axios.post(`/propostas/${id}/adjudicar`);
  return response.data;
};

export const converterParaProjetoAPI = async (id: number): Promise<Projeto> => {
  const response = await axios.post(`/propostas/${id}/adjudicar`);
  return response.data;
};

export const updatePropostaStatusAPI = async (
  id: number,
  status: string
): Promise<Proposta> => {
  const response = await axios.patch(
    `/propostas/${id}/status?status=${status}`
  );
  return response.data;
};
