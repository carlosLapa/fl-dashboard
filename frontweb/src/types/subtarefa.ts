export interface SubtarefaUser {
  id: number;
  name: string;
  funcao?: string;
  cargo?: string;
  email?: string;
}

export interface Subtarefa {
  id: number;
  tarefaId: number;
  user: SubtarefaUser;
  descricao?: string;
  percentual: number;
  concluida: boolean;
  concluidaEm?: string;
}

export interface SubtarefaDivisaoItem {
  userId: number;
  descricao?: string;
}
