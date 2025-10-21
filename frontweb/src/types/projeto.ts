import { User } from './user';
import { Tarefa } from './tarefa';
import { Externo } from './externo';

export type TipoProjeto =
  | 'ASSESSORIA'
  | 'CONSULTORIA'
  | 'FISCALIZACAO'
  | 'LEVANTAMENTO'
  | 'PROJETO'
  | 'REVISAO'
  | 'VISTORIA';

export type Projeto = {
  id: number;
  projetoAno: number;
  designacao: string;
  entidade?: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  users: User[];
  status: string;
  coordenador?: User;
  dataProposta?: string;
  dataAdjudicacao?: string;
  externos?: Externo[];
  tipo?: TipoProjeto;
  cliente?: {
    id: number;
    name: string;
  };
};

export interface ProjetoFormData {
  projetoAno: number;
  designacao: string;
  entidade?: string;
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
  tipo?: TipoProjeto;
}

export interface ProjetoMinDTO {
  id: number;
  designacao: string;
  // tipo?: TipoProjeto; -- se eventualmente quisermos mostrar o tipo no minDTO
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
