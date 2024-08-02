import { User } from './user';
import { Projeto } from './projeto';

export interface Tarefa {
  id: number;
  descricao: string;
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
  prioridade: string;
  prazoEstimado: string;
  prazoReal: string;
  users: User[];
  projeto: Projeto;
}

export interface KanbanTarefa extends Tarefa {
  column: string;
  uniqueId: string;
}
