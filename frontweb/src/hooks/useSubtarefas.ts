import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  getSubtarefas,
  dividirSubtarefas,
  atualizarSubtarefa,
  concluirSubtarefa,
  reabrirSubtarefa,
  desfazerDivisao,
  getTotalPercentualConcluido,
} from 'services/subtarefaService';
import { Subtarefa, SubtarefaDivisaoItem } from 'types/subtarefa';

export const useSubtarefas = (tarefaId?: number) => {
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!tarefaId) {
      setSubtarefas([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubtarefas(tarefaId);
      setSubtarefas(data);
    } catch (err) {
      setError('Erro ao carregar subtarefas');
    } finally {
      setIsLoading(false);
    }
  }, [tarefaId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const dividir = useCallback(
    async (itens?: SubtarefaDivisaoItem[]) => {
      if (!tarefaId) return;
      try {
        const data = await dividirSubtarefas(tarefaId, itens);
        setSubtarefas(data);
        toast.success('Tarefa dividida em subtarefas.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao dividir a tarefa.';
        toast.error(message);
      }
    },
    [tarefaId],
  );

  const atualizar = useCallback(
    async (subtarefaId: number, descricao: string) => {
      if (!tarefaId) return;
      try {
        const updated = await atualizarSubtarefa(tarefaId, subtarefaId, descricao);
        setSubtarefas((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success('Subtarefa atualizada.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao atualizar subtarefa.';
        toast.error(message);
      }
    },
    [tarefaId],
  );

  const concluir = useCallback(
    async (subtarefaId: number) => {
      if (!tarefaId) return;
      try {
        const updated = await concluirSubtarefa(tarefaId, subtarefaId);
        setSubtarefas((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success('Subtarefa concluída.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao concluir subtarefa.';
        toast.error(message);
      }
    },
    [tarefaId],
  );

  const reabrir = useCallback(
    async (subtarefaId: number) => {
      if (!tarefaId) return;
      try {
        const updated = await reabrirSubtarefa(tarefaId, subtarefaId);
        setSubtarefas((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s)),
        );
        toast.success('Subtarefa reaberta.');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao reabrir subtarefa.';
        toast.error(message);
      }
    },
    [tarefaId],
  );

  const desfazer = useCallback(async () => {
    if (!tarefaId) return;
    try {
      await desfazerDivisao(tarefaId);
      setSubtarefas([]);
      toast.success('Divisão em subtarefas desfeita.');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Erro ao desfazer a divisão em subtarefas.';
      toast.error(message);
    }
  }, [tarefaId]);

  return {
    subtarefas,
    isLoading,
    error,
    isDividida: subtarefas.length > 0,
    totalPercentual: getTotalPercentualConcluido(subtarefas),
    dividir,
    atualizar,
    concluir,
    reabrir,
    desfazer,
    refetch,
  };
};

export default useSubtarefas;
