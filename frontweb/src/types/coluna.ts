import { TarefaStatus } from './tarefa';

export interface ColunaWithProjetoDTO {
  id: number;
  status: TarefaStatus;
  titulo: string;
  ordem: number;
  projetoId: number;
}
