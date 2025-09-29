import { Cliente } from './cliente';

export type TipoProposta =
  | 'ASSESSORIA'
  | 'CONSULTORIA'
  | 'FISCALIZACAO'
  | 'LEVANTAMENTO'
  | 'PROJETO'
  | 'REVISAO'
  | 'VISTORIA';

export type Proposta = {
  id: number;
  propostaAno: number;
  designacao: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  status: string;
  dataProposta?: string;
  dataAdjudicacao?: string;
  tipo?: TipoProposta;
  clientes: Cliente[];
};

export interface PropostaFormData {
  propostaAno: number;
  designacao: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  status: string;
  dataProposta?: string;
  dataAdjudicacao?: string;
  tipo?: TipoProposta;
  clienteIds: number[];
}

export interface PropostaMinDTO {
  id: number;
  designacao: string;
  status: string;
}

export interface PaginatedPropostas {
  content: Proposta[];
  totalPages: number;
  totalElements?: number;
  size?: number;
  number?: number;
}
