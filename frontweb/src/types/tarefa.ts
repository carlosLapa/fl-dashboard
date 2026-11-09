import { User } from './user';
import { Projeto } from './projeto';
import { ExternoDTO } from './externo';
import { RequisicaoEquipamento } from './equipamento';

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
  requisicoes?: RequisicaoEquipamento[];
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
  // Phase of the projeto's timeline (see types/projetoFase); null = "sem fase".
  faseId?: number | null;
  // Read-only deviation data, recorded by the backend. diasEstimados is the plan frozen when
  // the tarefa first had both dates; dataConclusao is when it last moved to DONE; diasReais is
  // the working days from prazoEstimado to dataConclusao (null until DONE).
  diasEstimados?: number | null;
  dataConclusao?: string | null;
  diasReais?: number | null;
  // Review time kept apart from work time (diasTrabalho = diasReais - diasEmRevisao);
  // the deviation is measured on diasTrabalho. devolucoes = times sent back from review.
  entradaRevisao?: string | null;
  diasEmRevisao?: number;
  devolucoes?: number;
  diasTrabalho?: number | null;
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
  faseId?: number | null;
  links?: TarefaLink[];
  requisicoes?: RequisicaoEquipamento[];
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
  // Leave undefined to keep the saved phase (the key is then left out of the JSON);
  // send null to remove it. The backend tells the two apart.
  faseId?: number | null;
  links?: TarefaLink[];
  requisicoes?: RequisicaoEquipamento[];
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
