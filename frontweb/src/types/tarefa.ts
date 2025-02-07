import { User } from './user';
import { Projeto } from './projeto';

export type TarefaStatus =
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE';

export interface Tarefa {
  id: number;
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  projeto: {
    id: number;
    designacao: string;
  };
  users: {
    id: number;
    name: string;
  }[];
}

export interface TarefaFormData {
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  users: User[];
  projeto: Projeto;
}

export interface TarefaInsertFormData {
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  projetoId: number;
  userIds: number[];
}

export interface TarefaUpdateFormData {
  id: number;
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  status: TarefaStatus;
  projetoId: number;
  userIds: number[];
}

export type TarefaWithUserAndProjetoDTO = Tarefa & {
  projeto: Projeto;
  users: User[];
};

export type TarefaWithUsersDTO = Tarefa & {
  users: User[];
};

export interface KanbanTarefa extends Tarefa {
  column: string;
  uniqueId: string;
}

export interface PaginatedTarefas {
  content: TarefaWithUserAndProjetoDTO[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}
