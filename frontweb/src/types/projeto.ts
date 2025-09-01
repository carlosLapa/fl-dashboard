import { User } from './user';
import { Tarefa } from './tarefa';
import { Externo } from './externo';

export type Projeto = {
  id: number;
  projetoAno: number;
  designacao: string;
  entidade: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  users: User[];
  status: string;
  coordenador?: User;
  dataProposta?: string;
  dataAdjudicacao?: string;
  externos?: Externo[];
};

export interface ProjetoFormData {
  projetoAno: number;
  designacao: string;
  entidade: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  users: User[];
  status: string;
  clienteId?: number;
  coordenadorId?: number;
  dataProposta?: string;
  dataAdjudicacao?: string;
  externos?: Externo[];
  externoIds?: number[];
}

export interface ProjetoMinDTO {
  id: number;
  designacao: string;
}

export type ProjetoWithUsersAndTarefasDTO = Projeto & {
  tarefas: Tarefa[];
};

export interface PaginatedProjetos {
  content: Projeto[];
  totalPages: number;
  totalElements?: number;
  size?: number;
  number?: number;
}
