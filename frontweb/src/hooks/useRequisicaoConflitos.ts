import { useEffect, useState } from 'react';
import {
  getConflitosRequisicao,
  isRequisicaoCompleta,
} from 'services/equipamentoService';
import {
  RequisicaoEquipamento,
  RequisicaoEquipamentoDetalhe,
} from 'types/equipamento';

const DEBOUNCE_MS = 400;

/**
 * Live overlap check for the requisições being edited in a tarefa. Returns, by
 * row index, the other tarefas' requisições overlapping that row.
 */
export const useRequisicaoConflitos = (
  requisicoes: RequisicaoEquipamento[] | undefined,
  tarefaId: number | undefined,
  enabled: boolean,
): Record<number, RequisicaoEquipamentoDetalhe[]> => {
  const [conflitos, setConflitos] = useState<
    Record<number, RequisicaoEquipamentoDetalhe[]>
  >({});

  // Only the fields that affect the result, so typing in Observações doesn't refetch.
  const chave = (requisicoes || [])
    .map((r) => `${r.equipamentoId}|${r.dataInicio}|${r.dataFim}`)
    .join(';');

  useEffect(() => {
    const linhas = (requisicoes || [])
      .map((requisicao, index) => ({ requisicao, index }))
      .filter(({ requisicao }) => isRequisicaoCompleta(requisicao));

    if (!enabled || linhas.length === 0) {
      setConflitos({});
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      Promise.all(
        linhas.map(({ requisicao }) =>
          getConflitosRequisicao(requisicao, tarefaId),
        ),
      )
        .then((resultados) => {
          if (cancelled) return;
          const porLinha: Record<number, RequisicaoEquipamentoDetalhe[]> = {};
          linhas.forEach(({ index }, i) => {
            porLinha[index] = resultados[i];
          });
          setConflitos(porLinha);
        })
        .catch((error) => {
          // The check is advisory and the save doesn't depend on it, so a failure
          // here shouldn't interrupt whoever is filling in the task.
          console.error('Error checking requisição conflicts:', error);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, tarefaId, enabled]);

  return conflitos;
};
