import { TarefaStatus } from './tarefa';

/**
 * DTO for collaborator performance metrics aggregated across ALL projects
 * (as opposed to CollaboratorMetricsDTO in projetoMetrics.ts, which is scoped
 * to a single project)
 * Corresponds to backend CollaboratorGlobalMetricsDTO
 */
export interface CollaboratorGlobalMetricsDTO {
  colaboradorId: number;
  colaboradorNome: string;
  totalProjetos: number;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmProgresso: number;
  tarefasPendentes: number;
  tempoMedioDias: number;
  taxaConclusao: number; // Percentage (0-100)
}

/**
 * Per-task detail row for a single collaborator: which task, which project,
 * and the working-days measurement used as the agreed proxy for "time spent".
 * Corresponds to backend TarefaUserDetalheDTO.
 */
export interface TarefaUserDetalheDTO {
  tarefaId: number;
  descricao: string;
  projetoId: number;
  projetoDesignacao: string;
  status: TarefaStatus;
  prazoEstimado: string;
  prazoReal: string;
  workingDays: number | null;
}
