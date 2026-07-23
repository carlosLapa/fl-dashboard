import axios from './apiConfig';
import { Subtarefa, SubtarefaDivisaoItem } from '../types/subtarefa';

export const getSubtarefasAPI = async (
  tarefaId: number,
): Promise<Subtarefa[]> => {
  const response = await axios.get<Subtarefa[]>(
    `/tarefas/${tarefaId}/subtarefas`,
  );
  return response.data;
};

export const dividirSubtarefasAPI = async (
  tarefaId: number,
  itens?: SubtarefaDivisaoItem[],
): Promise<Subtarefa[]> => {
  try {
    const response = await axios.post<Subtarefa[]>(
      `/tarefas/${tarefaId}/subtarefas/dividir`,
      itens,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Erro ao dividir a tarefa em subtarefas.');
  }
};

export const concluirSubtarefaAPI = async (
  tarefaId: number,
  subtarefaId: number,
): Promise<Subtarefa> => {
  try {
    const response = await axios.put<Subtarefa>(
      `/tarefas/${tarefaId}/subtarefas/${subtarefaId}/concluir`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Só pode concluir a sua própria subtarefa.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error('Erro ao concluir a subtarefa.');
  }
};
