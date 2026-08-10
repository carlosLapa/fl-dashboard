export type ProjetoUserHistoryActionType = 'ADDED' | 'REMOVED';

/**
 * A single "added to" / "removed from" project event for a collaborator.
 * Corresponds to backend ProjetoUserHistoryEventDTO.
 */
export interface ProjetoUserHistoryEventDTO {
  id: number;
  projetoId: number;
  projetoDesignacao: string;
  action: ProjetoUserHistoryActionType;
  eventDate: string; // ISO datetime string
}

/** One point of the "active projects per month" step chart. */
export interface MonthlyProjectCountDTO {
  yearMonth: string; // "yyyy-MM"
  activeProjects: number;
}

/**
 * Total time a collaborator has spent assigned to a project (summed across
 * every ADDED-to-REMOVED cycle). "ativo" means the assignment is ongoing,
 * with totalDias counted up to now.
 */
export interface ProjetoTimeSpentDTO {
  projetoId: number;
  projetoDesignacao: string;
  totalDias: number;
  ativo: boolean;
}

/**
 * Full project-assignment history for one collaborator.
 * Corresponds to backend ProjetoUserHistoryTimelineDTO.
 */
export interface ProjetoUserHistoryTimelineDTO {
  userId: number;
  eventos: ProjetoUserHistoryEventDTO[];
  projetosAtivosPorMes: MonthlyProjectCountDTO[];
  tempoPorProjeto: ProjetoTimeSpentDTO[];
}
