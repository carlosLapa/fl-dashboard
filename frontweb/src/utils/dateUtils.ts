import { differenceInDays, format } from 'date-fns';

export interface DeadlineStatus {
  isApproaching: boolean;
  daysRemaining: number | null;
  isOverdue: boolean;
  formattedTaskDate?: string;
  formattedProjectDate?: string;
}

export interface TaskOverdueStatus {
  isPastDue: boolean;
  daysOverdue: number | null;
  formattedTaskDate?: string;
}

/**
 * Formats a date string to a localized format
 * @param dateString The date string to format
 * @param locale The locale to use (defaults to 'pt-PT')
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  locale: string = 'pt-PT'
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if formatting fails
  }
};

/**
 * Formats a date string to include time
 * @param dateString The date string to format
 * @param locale The locale to use (defaults to 'pt-PT')
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string,
  locale: string = 'pt-PT'
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateString; // Return original if formatting fails
  }
};

/**
 * Check if a task deadline is approaching its project deadline
 * @param taskDeadline The task deadline (ISO date string)
 * @param projectDeadline The project deadline (ISO date string)
 * @param warningThreshold Number of days to consider as "approaching" (default: 5)
 * @returns An object with status information
 */
export const getDeadlineStatus = (
  taskDeadline: string | undefined,
  projectDeadline: string | undefined,
  warningThreshold = 5
): DeadlineStatus => {
  console.log('getDeadlineStatus input:', {
    taskDeadline,
    projectDeadline,
    warningThreshold,
  });

  if (!taskDeadline || !projectDeadline) {
    console.log('Missing deadline(s):', { taskDeadline, projectDeadline });
    return {
      isApproaching: false,
      daysRemaining: null,
      isOverdue: false,
    };
  }

  try {
    const taskDate = new Date(taskDeadline);
    const projectDate = new Date(projectDeadline);

    console.log('Parsed dates:', {
      taskDate: taskDate.toISOString(),
      projectDate: projectDate.toISOString(),
      taskValid: !isNaN(taskDate.getTime()),
      projectValid: !isNaN(projectDate.getTime()),
    });

    // Set time to midnight for accurate day comparison
    taskDate.setHours(0, 0, 0, 0);
    projectDate.setHours(0, 0, 0, 0);

    // Calculate days between task deadline and project deadline
    const daysRemaining = differenceInDays(projectDate, taskDate);
    console.log('Days remaining:', daysRemaining);

    // A task's deadline can sit close to the project's deadline months in
    // advance without that being urgent yet — e.g. a task due the same day
    // as the project, started on day one of a 43-working-day run. Only
    // treat it as "approaching" once the task's own deadline is itself
    // imminent (within the threshold of today, and not already past —
    // that's getTaskOverdueStatus's job).
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilTaskDeadline = differenceInDays(taskDate, today);
    const isTaskDeadlineImminent =
      daysUntilTaskDeadline >= 0 && daysUntilTaskDeadline <= warningThreshold;

    // Check if task deadline is within the warning threshold of project deadline
    const isApproaching =
      isTaskDeadlineImminent &&
      daysRemaining >= 0 &&
      daysRemaining <= warningThreshold;
    console.log(
      'Is approaching:',
      isApproaching,
      '(threshold:',
      warningThreshold,
      ')'
    );

    return {
      isApproaching,
      daysRemaining,
      isOverdue: daysRemaining < 0,
      formattedTaskDate: format(taskDate, 'dd/MM/yyyy'),
      formattedProjectDate: format(projectDate, 'dd/MM/yyyy'),
    };
  } catch (e) {
    console.error('Error calculating deadline status:', e);
    return {
      isApproaching: false,
      daysRemaining: null,
      isOverdue: false,
    };
  }
};

/**
 * Check whether a task's own deadline has already passed, regardless of
 * any project deadline — independent from getDeadlineStatus, which only
 * flags a task relative to its project's deadline (and requires the
 * project to have one set).
 * @param taskDeadline The task deadline (ISO date string)
 * @param taskStatus The task's current status — a DONE task is never "past due"
 */
export const getTaskOverdueStatus = (
  taskDeadline: string | undefined,
  taskStatus: string | undefined
): TaskOverdueStatus => {
  if (!taskDeadline || taskStatus === 'DONE') {
    return { isPastDue: false, daysOverdue: null };
  }

  try {
    const taskDate = new Date(taskDeadline);
    if (isNaN(taskDate.getTime())) {
      return { isPastDue: false, daysOverdue: null };
    }
    taskDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysOverdue = differenceInDays(today, taskDate);

    return {
      isPastDue: daysOverdue > 0,
      daysOverdue: daysOverdue > 0 ? daysOverdue : null,
      formattedTaskDate: format(taskDate, 'dd/MM/yyyy'),
    };
  } catch (e) {
    console.error('Error calculating task overdue status:', e);
    return { isPastDue: false, daysOverdue: null };
  }
};

// Minimal shape needed to detect orphaned tasks — deliberately looser than
// the full Tarefa type since callers may fetch tasks via a DTO that omits
// fields like `projeto`/`users` (e.g. TarefaDTO nested inside a Projeto response).
export interface TarefaDeadlineInfo {
  id: number;
  prazoEstimado?: string;
  prazoReal?: string;
}

/**
 * Finds tasks whose own dates (prazoEstimado and/or prazoReal) now fall
 * after a project's (already-shortened) prazo — i.e. tasks left "orphaned"
 * by a project deadline that no longer covers them. Callers are expected to
 * only invoke this when the project's prazo was actually shortened; it does
 * not compare against the previous prazo itself.
 * @param tarefas Tasks belonging to the project
 * @param newProjetoPrazo The project's new prazo (ISO date string)
 */
export const findOrphanedTarefas = <T extends TarefaDeadlineInfo>(
  tarefas: T[],
  newProjetoPrazo: string
): T[] => {
  try {
    const newPrazoDate = new Date(newProjetoPrazo);
    if (isNaN(newPrazoDate.getTime())) return [];
    newPrazoDate.setHours(0, 0, 0, 0);

    return tarefas.filter((tarefa) => {
      return [tarefa.prazoEstimado, tarefa.prazoReal]
        .filter((d): d is string => Boolean(d))
        .some((dateStr) => {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return false;
          date.setHours(0, 0, 0, 0);
          return date > newPrazoDate;
        });
    });
  } catch (e) {
    console.error('Error finding orphaned tarefas:', e);
    return [];
  }
};

/**
 * Whether a single task's own dates fall after its project's current prazo
 * — i.e. it's "orphaned", regardless of how the project got that prazo.
 * Unlike `findOrphanedTarefas`, callers don't need to know the project's
 * previous prazo — this just compares against whatever prazo it has now, so
 * it's safe to call on every render (e.g. to highlight a table row).
 * @param tarefa The task to check
 * @param projetoPrazo The task's project's current prazo (ISO date string)
 */
export const isTarefaOrphaned = (
  tarefa: TarefaDeadlineInfo,
  projetoPrazo: string | undefined
): boolean => {
  if (!projetoPrazo) return false;
  return findOrphanedTarefas([tarefa], projetoPrazo).length > 0;
};
