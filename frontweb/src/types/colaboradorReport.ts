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
