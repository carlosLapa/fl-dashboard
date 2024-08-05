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
    username: string;
  }[];
}

export interface TarefaFormData {
  descricao: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  users: User[];
  projeto: Projeto;
}

export type TarefaWithUsersAndProjetoDTO = Tarefa & {
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
