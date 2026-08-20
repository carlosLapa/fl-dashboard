import { FrequenciaRecorrencia } from '../types/tarefa';

export const FREQUENCIA_RECORRENCIA_LABELS: Record<FrequenciaRecorrencia, string> = {
  SEMANAL: 'Semanal',
  QUINZENAL: 'Quinzenal',
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual',
};

export const getFrequenciaRecorrenciaLabel = (frequencia: string): string =>
  FREQUENCIA_RECORRENCIA_LABELS[frequencia as FrequenciaRecorrencia] ?? frequencia;
