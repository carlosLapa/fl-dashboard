import axios from './apiConfig';
import { CollaboratorGlobalMetricsDTO } from '../types/colaboradorReport';

/**
 * Fetch collaborator performance metrics aggregated across ALL projects
 *
 * Requires VIEW_REPORTS permission (Admin/Manager roles)
 *
 * @returns Promise<CollaboratorGlobalMetricsDTO[]> Metrics per collaborator
 * @throws Error if user doesn't have permission
 */
export const getColaboradorGlobalMetricsAPI = async (): Promise<
  CollaboratorGlobalMetricsDTO[]
> => {
  try {
    const response = await axios.get<CollaboratorGlobalMetricsDTO[]>(
      '/relatorios/colaboradores',
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Não tem permissão para visualizar este relatório');
    }

    throw new Error(
      'Erro ao carregar relatório de colaboradores. Por favor, tente novamente.',
    );
  }
};
