import { PropostaStatus } from '../types/proposta';

export const PROPOSTA_STATUS_LABELS: Record<PropostaStatus, string> = {
  ATIVO: 'Ativo',
  EM_ANALISE: 'Em Análise',
  ADJUDICADA: 'Adjudicada',
  RECUSADA: 'Recusada',
};

export const getPropostaStatusLabel = (status: string): string =>
  PROPOSTA_STATUS_LABELS[status as PropostaStatus] ?? status;
