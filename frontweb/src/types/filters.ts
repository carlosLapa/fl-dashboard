import { TipoProjeto } from './projeto';

// Define the base filter state interface
export interface BaseFilterState {
  [key: string]: any;
}

// Projeto filter state
export interface ProjetoFilterState {
  designacao?: string;
  // Remover entidade
  prioridade?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  coordenadorId?: number;
  propostaStartDate?: string;
  propostaEndDate?: string;
  adjudicacaoStartDate?: string;
  adjudicacaoEndDate?: string;
  cliente?: string; // Nome do cliente para filtragem por texto
  clienteId?: number; // ID do cliente para filtragem exata
  tipo?: TipoProjeto | 'ALL'; // <-- mais explícito
}

// Tarefa filter state
export interface TarefaFilterState extends BaseFilterState {
  descricao: string;
  status: string;
  projetoId: string;
  startDate: string;
  endDate: string;
  dateFilterField: string; // 'prazoEstimado' | 'dataCriacao' | 'dataAtualizacao'
}

// User filter state (for possible future use)
export interface UserFilterState extends BaseFilterState {
  name: string;
  email: string;
  role: string;
}
