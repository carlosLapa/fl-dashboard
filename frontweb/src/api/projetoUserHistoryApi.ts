import axios from './apiConfig';
import { ProjetoUserHistoryTimelineDTO } from '../types/projetoUserHistory';

/**
 * Fetch a collaborator's project-assignment history (added-to/removed-from
 * events, plus a monthly active-projects breakdown).
 *
 * Requires VIEW_REPORTS, or the collaborator viewing their own history.
 */
export const getProjetoUserHistoryAPI = async (
  userId: number,
): Promise<ProjetoUserHistoryTimelineDTO> => {
  try {
    const response = await axios.get<ProjetoUserHistoryTimelineDTO>(
      `/users/${userId}/projeto-history`,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Não tem permissão para visualizar este histórico');
    }

    throw new Error(
      'Erro ao carregar histórico de projetos. Por favor, tente novamente.',
    );
  }
};
