import { getTarefaUserDetalheAPI } from '../api/tarefaUserDetalheApi';
import { TarefaUserDetalheDTO } from '../types/colaboradorReport';

export const getTarefaUserDetalhe = async (
  userId: number,
): Promise<TarefaUserDetalheDTO[]> => {
  return getTarefaUserDetalheAPI(userId);
};
