export interface Equipamento {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo: boolean;
}

export interface EquipamentoFormData {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

// A requisição as held by its tarefa. Dates are 'yyyy-MM-dd' whole days, both inclusive.
export interface RequisicaoEquipamento {
  id?: number;
  equipamentoId: number;
  // Read-only, filled in by the backend.
  equipamentoNome?: string;
  equipamentoAtivo?: boolean;
  dataInicio: string;
  dataFim: string;
  observacoes?: string | null;
}

// A requisição plus who holds it, for the conflict warning and the Equipamentos page.
export interface RequisicaoEquipamentoDetalhe {
  id: number;
  equipamentoId: number;
  equipamentoNome: string;
  dataInicio: string;
  dataFim: string;
  observacoes?: string | null;
  tarefaId: number;
  tarefaDescricao: string;
  projetoDesignacao?: string | null;
  colaboradores: string[];
  conflito: boolean;
}
