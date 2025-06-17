// Define the base filter state interface
export interface BaseFilterState {
  [key: string]: string;
}

// Projeto filter state
export interface ProjetoFilterState extends BaseFilterState {
  designacao: string;
  entidade: string;
  prioridade: string;
  status: string;
  startDate: string;
  endDate: string;
}

// Tarefa filter state (for future use)
export interface TarefaFilterState extends BaseFilterState {
  descricao: string;
  status: string;
  projetoId: string;
  startDate: string;
  endDate: string;
  dateFilterField: string; // 'prazoEstimado' | 'dataCriacao' | 'dataAtualizacao'
}

// User filter state (for future use)
export interface UserFilterState extends BaseFilterState {
  name: string;
  email: string;
  role: string;
}
