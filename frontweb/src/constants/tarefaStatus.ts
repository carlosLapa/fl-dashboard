import { TarefaStatus } from '../types/tarefa';

export const TAREFA_STATUS_LABELS: Record<TarefaStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Progresso',
  IN_REVIEW: 'Em Revisão',
  DONE: 'Concluído',
};

export const getTarefaStatusLabel = (status: string): string =>
  TAREFA_STATUS_LABELS[status as TarefaStatus] ?? status;
