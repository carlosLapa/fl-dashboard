import { User } from './user';
import { Projeto } from './projeto';

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
