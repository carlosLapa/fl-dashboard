export type SnapshotTriggerType = 'MANUAL' | 'SCHEDULED';

/**
 * Point-in-time capture of a project's KPIs, for comparison across dates.
 * Corresponds to backend ProjetoMetricsSnapshotDTO.
 */
export interface ProjetoMetricsSnapshotDTO {
  id: number;
  projetoId: number;
  snapshotDate: string; // ISO date string (yyyy-MM-dd)
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmProgresso: number;
  tarefasPendentes: number;
  tempoMedioDias: number;
  taxaConclusao: number; // Percentage (0-100)
  triggerType: SnapshotTriggerType;
  triggeredByUser?: {
    id: number;
    name: string;
  };
  createdAt: string; // ISO datetime string
}
