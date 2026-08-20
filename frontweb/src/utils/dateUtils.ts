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

    // Check if task deadline is within the warning threshold of project deadline
    const isApproaching =
      daysRemaining >= 0 && daysRemaining <= warningThreshold;
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
