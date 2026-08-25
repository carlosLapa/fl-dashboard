import axios from './apiConfig';
import { TarefaUserDetalheDTO } from '../types/colaboradorReport';

/**
 * Fetch a collaborator's task detail (task, project, status, working days).
 *
 * Requires VIEW_REPORTS, or the collaborator viewing their own data.
 */
export const getTarefaUserDetalheAPI = async (
  userId: number,
): Promise<TarefaUserDetalheDTO[]> => {
  try {
    const response = await axios.get<TarefaUserDetalheDTO[]>(
      `/users/${userId}/tarefas-detalhe`,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Não tem permissão para visualizar este detalhe');
    }

    throw new Error(
      'Erro ao carregar detalhe de tarefas. Por favor, tente novamente.',
    );
  }
};
