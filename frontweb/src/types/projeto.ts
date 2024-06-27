import { User } from "./user";

export type Projeto = {
  id: number;
  projetoAno: number;
  designacao: string;
  entidade: string;
  prioridade: string;
  observacao: string;
  prazo: string;
  //users: User[];
}

export interface ProjetoFormData {
  projetoAno: number;
  designacao: string;
  entidade: string;
  prioridade: string;
  observacao: string;
  prazo: string;
}