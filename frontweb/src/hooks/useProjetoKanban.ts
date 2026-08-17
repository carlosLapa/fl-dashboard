import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  getTarefaWithUsers,
  getColumnsForProject,
  updateTarefa,
  updateTarefaStatus,
  arquivarTarefa,
} from 'services/tarefaService';
import { KanbanTarefa, TarefaStatus, TarefaUpdateFormData } from 'types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import { NotificationType } from 'types/notification';
import { useNotification } from 'NotificationContext';

export type KanbanColumns = { [key in TarefaStatus]: KanbanTarefa[] };

const EMPTY_COLUMNS: KanbanColumns = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  IN_REVIEW: [],
  DONE: [],
};

// Thrown by the query when the project itself is gone (deleted, or the
// current user lost access) — distinct from a transient/generic fetch
// failure so the component can show a different message for each.
export class ProjetoIndisponivelError extends Error {}

function isTarefaStatus(status: unknown): status is TarefaStatus {
  return (
    typeof status === 'string' &&
    ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(status)
  );
}

function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const endDateMidnight = new Date(endDate);
  endDateMidnight.setHours(0, 0, 0, 0);

  while (currentDate <= endDateMidnight) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}

// Notification types that imply the board's underlying data may have
// changed and is worth refetching (as opposed to types that are purely
// informational, e.g. TAREFA_PRAZO_PROXIMO).
const BOARD_RELEVANT_NOTIFICATION_TYPES = new Set<NotificationType>([
  NotificationType.TAREFA_STATUS_ALTERADO,
  NotificationType.TAREFA_EDITADA,
  NotificationType.TAREFA_REMOVIDA,
  NotificationType.TAREFA_ATRIBUIDA,
  NotificationType.SUBTAREFA_ATRIBUIDA,
  NotificationType.SUBTAREFA_CONCLUIDA,
]);

async function fetchKanbanColumns(
  projeto: ProjetoWithUsersAndTarefasDTO
): Promise<KanbanColumns> {
  try {
    // The response isn't used for anything beyond this call's side effect of
    // detecting whether the project itself is still reachable — tasks are
    // grouped by their own `status` field below, not by these Coluna rows.
    await getColumnsForProject(projeto.id);
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 400 ||
        error.response?.status === 404 ||
        error.response?.status === 403)
    ) {
      throw new ProjetoIndisponivelError(
        'Este projeto foi excluído ou não está mais disponível.'
      );
    }
    throw error;
  }

  const updatedColumns: KanbanColumns = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  };

  const hasValidTarefas =
    projeto.tarefas &&
    Array.isArray(projeto.tarefas) &&
    projeto.tarefas.length > 0;

  if (!hasValidTarefas) {
    return updatedColumns;
  }

  // Fetch every tarefa in parallel instead of sequentially — a sequential
  // N+1 multiplies network latency by the number of tasks in the project.
  const results = await Promise.allSettled(
    projeto.tarefas.map((tarefa) => getTarefaWithUsers(tarefa.id))
  );

  results.forEach((result, index) => {
    const tarefa = projeto.tarefas[index];

    if (result.status === 'rejected') {
      if (axios.isAxiosError(result.reason)) {
        const status = result.reason.response?.status;
        if (status === 404 || status === 403 || status === 400) {
          return;
        }
      }
      console.error(`Error fetching task ${tarefa.id}:`, result.reason);
      return;
    }

    const tarefaWithUsers = result.value;

    let workingDays: number | undefined = tarefaWithUsers.workingDays;
    if (
      workingDays === undefined &&
      tarefaWithUsers.prazoEstimado &&
      tarefaWithUsers.prazoReal &&
      !isNaN(new Date(tarefaWithUsers.prazoEstimado).getTime()) &&
      !isNaN(new Date(tarefaWithUsers.prazoReal).getTime())
    ) {
      workingDays = calculateWorkingDays(
        new Date(tarefaWithUsers.prazoEstimado),
        new Date(tarefaWithUsers.prazoReal)
      );
    }

    const kanbanTarefa: KanbanTarefa = {
      ...tarefaWithUsers,
      column: tarefaWithUsers.status as TarefaStatus,
      projeto: { id: projeto.id, designacao: projeto.designacao },
      // Stable across re-fetches (used as key/draggableId) — a uniqueId
      // based on Date.now() used to change on every refetch, forcing every
      // card (and its subtarefas requests) to unmount/remount on each edit.
      uniqueId: String(tarefa.id),
      workingDays,
    };

    if (
      isTarefaStatus(kanbanTarefa.status) &&
      kanbanTarefa.status in updatedColumns
    ) {
      updatedColumns[kanbanTarefa.status].push(kanbanTarefa);
    } else {
      updatedColumns.BACKLOG.push(kanbanTarefa);
    }
  });

  return updatedColumns;
}

interface MoveTarefaVariables {
  tarefa: KanbanTarefa;
  newStatus: TarefaStatus;
  statusLabel: string;
  newColumns: KanbanColumns;
}

interface ChangeTarefaStatusVariables {
  tarefaId: number;
  newStatus: TarefaStatus;
}

export function useProjetoKanban(projeto: ProjetoWithUsersAndTarefasDTO) {
  const queryClient = useQueryClient();
  const { lastLiveNotification } = useNotification();

  const queryKey = useMemo(
    () => ['kanban', projeto.id] as const,
    [projeto.id]
  );

  const query = useQuery({
    queryKey,
    queryFn: () => fetchKanbanColumns(projeto),
  });

  const moveTarefaMutation = useMutation({
    // The backend already notifies every assigned user, and the project
    // coordinator if not already assigned, as part of the status update —
    // this used to also send its own coordinator notification, duplicating it.
    mutationFn: async ({ tarefa, newStatus }: MoveTarefaVariables) => {
      await updateTarefaStatus(tarefa.id, newStatus);
    },
    onMutate: async (variables: MoveTarefaVariables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousColumns = queryClient.getQueryData<KanbanColumns>(queryKey);
      queryClient.setQueryData(queryKey, variables.newColumns);
      return { previousColumns };
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `Tarefa "${variables.tarefa.descricao}" movida para "${variables.statusLabel}"`
      );
    },
    onError: (error, _variables, context) => {
      console.error('Failed to update tarefa status:', error);
      // updateTarefaStatus rethrows a plain Error with the backend message
      // for the 409 "subtarefas incompletas" case; any other (Axios) error
      // keeps the generic message instead of surfacing a raw HTTP error.
      const message =
        !axios.isAxiosError(error) && error instanceof Error && error.message
          ? error.message
          : 'Falha ao atualizar o status da tarefa';
      toast.error(message);
      if (context?.previousColumns) {
        queryClient.setQueryData(queryKey, context.previousColumns);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const changeTarefaStatusMutation = useMutation({
    mutationFn: ({ tarefaId, newStatus }: ChangeTarefaStatusVariables) =>
      updateTarefaStatus(tarefaId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast.error('Erro ao atualizar status da tarefa');
    },
  });

  const saveTarefaEditMutation = useMutation({
    mutationFn: (formData: TarefaUpdateFormData) =>
      updateTarefa(formData.id, formData),
    onSuccess: () => {
      toast.success('Tarefa atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error);
      if (error instanceof Error && error.message.includes('prazo')) {
        toast.error(error.message);
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Another user saved this same tarefa first (optimistic-locking
        // conflict) — the stale data can't just be resubmitted, so refetch
        // instead of leaving the cache pointed at data we know is stale.
        toast.error(
          error.response?.data?.message ??
            'Esta tarefa foi alterada por outra pessoa entretanto. A recarregar dados atualizados.'
        );
        queryClient.invalidateQueries({ queryKey });
        return;
      }
      toast.error('Erro ao atualizar tarefa');
    },
  });

  const archiveTarefaMutation = useMutation({
    mutationFn: (tarefaId: number) => arquivarTarefa(tarefaId),
    onSuccess: () => {
      toast.success('Tarefa arquivada com sucesso!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Erro ao arquivar tarefa:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao arquivar tarefa'
      );
    },
  });

  // Tracks the id of the last live notification already handled, so this
  // effect doesn't invalidate again on unrelated re-renders (lastLiveNotification
  // only changes when a new WebSocket message actually arrives).
  const lastHandledNotificationId = useRef<number | null>(null);

  // Real-time invalidation: when another user changes a task in this same
  // project, the notification arrives via WebSocket (see NotificationContext)
  // and this refetches the board so both users converge on the same state
  // without a manual page refresh.
  useEffect(() => {
    if (!lastLiveNotification) return;
    if (lastLiveNotification.id === lastHandledNotificationId.current) return;

    lastHandledNotificationId.current = lastLiveNotification.id;

    const isForThisProject = lastLiveNotification.projeto?.id === projeto.id;
    const isRelevantType = BOARD_RELEVANT_NOTIFICATION_TYPES.has(
      lastLiveNotification.type
    );

    if (isForThisProject && isRelevantType) {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [lastLiveNotification, projeto.id, queryClient, queryKey]);

  return {
    columns: query.data ?? EMPTY_COLUMNS,
    isLoading: query.isLoading,
    error: query.error,
    isProjetoIndisponivel: query.error instanceof ProjetoIndisponivelError,
    moveTarefa: moveTarefaMutation.mutate,
    changeTarefaStatus: changeTarefaStatusMutation.mutate,
    saveTarefaEdit: saveTarefaEditMutation.mutate,
    archiveTarefa: archiveTarefaMutation.mutate,
  };
}

export default useProjetoKanban;
