import { User } from './user';
import { Projeto } from './projeto';

export type StatusType = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface Tarefa {
  id: number;
  descricao: string;
  status: StatusType;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
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
  status: StatusType;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  users: User[];
  projeto: Projeto;
}

/*
export type Tarefa = {
  id: number;
  descricao: string;
  status: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  assignedUsers: User[];
  projeto: Projeto;
};

export interface TarefaFormData {
  descricao: string;
  status: string;
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  assignedUsers: User[];
  projeto: Projeto;
}
*/
