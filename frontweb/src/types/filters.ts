// Define the base filter state interface
export interface BaseFilterState {
  [key: string]: any;
}

// Projeto filter state
export interface ProjetoFilterState {
  designacao?: string;
  entidade?: string;
  prioridade?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  // Add new filter fields
  coordenadorId?: number;
  propostaStartDate?: string;
  propostaEndDate?: string;
  adjudicacaoStartDate?: string;
  adjudicacaoEndDate?: string;
  cliente?: string;
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
