import { User } from './user';
import { Projeto } from './projeto';
import { ExternoDTO } from './externo';

export type TarefaStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE';

export type FrequenciaRecorrencia =
  | 'SEMANAL'
  | 'QUINZENAL'
  | 'MENSAL'
  | 'TRIMESTRAL'
  | 'ANUAL';

export interface TarefaLink {
  id?: number;
  url: string;
  descricao?: string;
}

export interface Tarefa {
  id: number;
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  links?: TarefaLink[];
  // Calculated field: number of working days between prazoEstimado and prazoReal (excludes weekends)
  workingDays?: number;
  arquivadaEm?: string | null;
  // Optimistic-locking counter, echoed back on update so the backend can detect
  // a concurrent edit instead of silently overwriting it.
  version?: number;
  recorrente?: boolean;
  frequenciaRecorrencia?: FrequenciaRecorrencia | null;
  dataFimRecorrencia?: string | null;
  // Server-computed, read-only — next date the scheduler will spawn a new occurrence.
  proximaOcorrencia?: string | null;
  // Set only on tasks generated automatically by the recurrence scheduler; points back to the template.
  tarefaOrigemId?: number | null;
  projeto: {
    id: number;
    designacao: string;
  };
  users: {
    id: number;
    name: string;
  }[];
  externos?: {
    // Add externos property as optional
    id: number;
    name: string;
    especialidades?: string[];
  }[];
}

export interface TarefaFormData {
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  workingDays?: number;
  users: User[];
  projeto: Projeto;
}

export interface TarefaInsertFormData {
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  workingDays?: number;
  projetoId: number;
  userIds: number[];
  externoIds?: number[];
  recorrente?: boolean;
  frequenciaRecorrencia?: FrequenciaRecorrencia;
  dataFimRecorrencia?: string;
  links?: TarefaLink[];
}

export interface TarefaUpdateFormData {
  id: number;
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  workingDays?: number;
  projetoId: number;
  userIds: number[];
  externoIds?: number[];
  version?: number;
  recorrente?: boolean;
  frequenciaRecorrencia?: FrequenciaRecorrencia;
  dataFimRecorrencia?: string;
  links?: TarefaLink[];
}

export type TarefaWithUserAndProjetoDTO = Tarefa & {
  projeto: Projeto;
  users: User[];
  externos?: ExternoDTO[];
};

export type TarefaWithExternoAndProjetoDTO = Tarefa & {
  projeto: Projeto;
  externos: ExternoDTO[];
};

export type TarefaWithUsersDTO = Tarefa & {
  users: User[];
};

export interface KanbanTarefa extends Tarefa {
  column: string;
  uniqueId: string;
}

export interface KanbanTarefaWithProjectDeadline extends KanbanTarefa {
  projeto: {
    id: number;
    designacao: string;
    prazo?: string;
  };
}

export interface PaginatedTarefas {
  content: TarefaWithUserAndProjetoDTO[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
