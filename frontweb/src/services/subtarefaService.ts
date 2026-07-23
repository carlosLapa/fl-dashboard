import {
  getSubtarefasAPI,
  dividirSubtarefasAPI,
  atualizarSubtarefaAPI,
  concluirSubtarefaAPI,
  reabrirSubtarefaAPI,
} from 'api/subtarefaApi';
import { Subtarefa, SubtarefaDivisaoItem } from 'types/subtarefa';

export const getSubtarefas = async (tarefaId: number): Promise<Subtarefa[]> =>
  getSubtarefasAPI(tarefaId);

export const dividirSubtarefas = async (
  tarefaId: number,
  itens?: SubtarefaDivisaoItem[],
): Promise<Subtarefa[]> => dividirSubtarefasAPI(tarefaId, itens);

export const atualizarSubtarefa = async (
  tarefaId: number,
  subtarefaId: number,
  descricao: string,
): Promise<Subtarefa> => atualizarSubtarefaAPI(tarefaId, subtarefaId, descricao);

export const concluirSubtarefa = async (
  tarefaId: number,
  subtarefaId: number,
): Promise<Subtarefa> => concluirSubtarefaAPI(tarefaId, subtarefaId);

export const reabrirSubtarefa = async (
  tarefaId: number,
  subtarefaId: number,
): Promise<Subtarefa> => reabrirSubtarefaAPI(tarefaId, subtarefaId);

export const getTotalPercentualConcluido = (
  subtarefas: Subtarefa[],
): number =>
  subtarefas
    .filter((s) => s.concluida)
    .reduce((total, s) => total + s.percentual, 0);

export const isDivididaCompleta = (subtarefas: Subtarefa[]): boolean =>
  subtarefas.length > 0 && getTotalPercentualConcluido(subtarefas) >= 100;
