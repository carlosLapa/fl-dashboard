import { getProjetoUserHistoryAPI } from '../api/projetoUserHistoryApi';
import { ProjetoUserHistoryTimelineDTO } from '../types/projetoUserHistory';

export const getProjetoUserHistory = async (
  userId: number,
): Promise<ProjetoUserHistoryTimelineDTO> => {
  return getProjetoUserHistoryAPI(userId);
};
