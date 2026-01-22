import { TarefaStatus } from './tarefa';

/**
 * DTO for individual task metrics in the "longest tasks" list
 */
export interface TaskMetricsDTO {
  tarefaId: number;
  descricao: string;
  prioridade: string;
  dataInicio?: string; // ISO date string from prazoEstimado
  dataFim?: string; // ISO date string from prazoReal
  workingDays?: number;
  status: TarefaStatus;
  colaboradores: string[]; // Array of user names
}

/**
 * DTO for metrics aggregated by collaborator
 */
export interface CollaboratorMetricsDTO {
  colaboradorId: number;
  colaboradorNome: string;
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmProgresso: number;
  tempoMedioDias: number;
  tarefasPorStatus: Record<string, number>; // Map of status -> count
}

/**
 * Main DTO containing all project metrics
 * Corresponds to backend ProjetoMetricsDTO
 */
export interface ProjetoMetricsDTO {
  projetoId: number;
  projetoNome: string;

  // General KPIs
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasEmProgresso: number;
  tarefasPendentes: number;
  tempoMedioDias: number;
  taxaConclusao: number; // Percentage (0-100)

  // Status distribution
  tarefasPorStatus: Record<string, number>; // Map of status -> count

  // Top longest tasks
  tarefasMaisLongas: TaskMetricsDTO[];

  // Collaborator metrics
  colaboradores: CollaboratorMetricsDTO[];

  // Project timeline
  primeiraDataInicio?: string; // ISO date string
  ultimaDataConclusao?: string; // ISO date string
}

/**
 * Helper type for chart data transformation
 */
export interface StatusDistributionChartData {
  status: string;
  count: number;
  percentage: number;
}

/**
 * Helper type for collaborator performance comparison
 */
export interface CollaboratorPerformanceData {
  name: string;
  completionRate: number; // Percentage
  averageDays: number;
  totalTasks: number;
}
