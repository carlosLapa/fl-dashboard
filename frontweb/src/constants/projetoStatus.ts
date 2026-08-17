import { ProjetoStatus } from '../types/projeto';

export const PROJETO_STATUS_LABELS: Record<ProjetoStatus, string> = {
  ATIVO: 'Ativo',
  EM_PROGRESSO: 'Em Progresso',
  CONCLUIDO: 'Concluído',
  SUSPENSO: 'Suspenso',
};

export const getProjetoStatusLabel = (status: string): string =>
  PROJETO_STATUS_LABELS[status as ProjetoStatus] ?? status;
