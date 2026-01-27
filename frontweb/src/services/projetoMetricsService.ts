import { ProjetoMetricsDTO } from '../types/projetoMetrics';
import { getProjetoMetricsAPI } from '../api/projetoMetricsApi';

/**
 * Fetch comprehensive metrics for a specific project
 *
 * Permission validation is handled at two levels:
 * 1. Frontend: ProtectedRoute component checks VIEW_ALL_PROJECTS
 * 2. Backend: ProjetoMetricsResource validates access control
 *
 * This service focuses on API communication and error handling.
 * Metrics include:
 * - General KPIs (tasks overview, completion rate, average working days)
 * - Status distribution
 * - Top 10 longest tasks
 * - Collaborator performance metrics
 * - Project timeline information
 *
 * @param projetoId The ID of the project to fetch metrics for
 * @returns Promise<ProjetoMetricsDTO> Complete project metrics
 * @throws Error if API call fails (403, 404, network error, etc.)
 */
export const getProjetoMetrics = async (
  projetoId: number,
): Promise<ProjetoMetricsDTO> => {
  try {
    const metrics = await getProjetoMetricsAPI(projetoId);

    return metrics;
  } catch (error) {
    throw error;
  }
};

/**
 * Helper function to calculate completion percentage for display
 * Already provided by backend but can be used for additional calculations
 *
 * @param completed Number of completed tasks
 * @param total Total number of tasks
 * @returns number Percentage rounded to 2 decimal places
 */
export const calculateCompletionRate = (
  completed: number,
  total: number,
): number => {
  if (total === 0) return 0;
  return (completed / total) * 100;
};

/**
 * Format working days for display
 *
 * @param days Number of working days
 * @returns string Formatted string with "dias" label
 */
export const formatWorkingDays = (days: number): string => {
  if (days === 0) return '0 dias';
  if (days === 1) return '1 dia';
  return `${days} dias`;
};

/**
 * Get status label in Portuguese
 * Maps internal status codes to user-friendly labels
 *
 * @param status Task status code
 * @returns string label for the status
 */
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    BACKLOG: 'Backlog',
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em Progresso',
    IN_REVIEW: 'Em Revisão',
    DONE: 'Concluído',
  };

  return statusLabels[status] || status;
};

/**
 * Sort collaborators by completion rate (descending)
 *
 * @param metrics ProjetoMetricsDTO containing collaborator data
 * @returns CollaboratorMetricsDTO[] Sorted array of collaborators
 */
export const sortCollaboratorsByCompletionRate = (
  metrics: ProjetoMetricsDTO,
) => {
  return [...metrics.colaboradores].sort((a, b) => {
    const rateA = calculateCompletionRate(a.tarefasConcluidas, a.totalTarefas);
    const rateB = calculateCompletionRate(b.tarefasConcluidas, b.totalTarefas);
    return rateB - rateA;
  });
};

/**
 * Sort collaborators by average working days (ascending - faster first)
 *
 * @param metrics ProjetoMetricsDTO containing collaborator data
 * @returns CollaboratorMetricsDTO[] Sorted array of collaborators
 */
export const sortCollaboratorsBySpeed = (metrics: ProjetoMetricsDTO) => {
  return [...metrics.colaboradores].sort((a, b) => {
    return a.tempoMedioDias - b.tempoMedioDias;
  });
};
