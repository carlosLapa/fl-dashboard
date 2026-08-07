import axios from './apiConfig';
import { ProjetoMetricsSnapshotDTO } from '../types/projetoMetricsSnapshot';

/**
 * Create a manual snapshot of the current metrics for a project.
 *
 * Requires the same access as viewing the project's metrics
 * (VIEW_ALL_PROJECTS, or assignment to the project).
 */
export const createProjetoMetricsSnapshotAPI = async (
  projetoId: number,
): Promise<ProjetoMetricsSnapshotDTO> => {
  try {
    const response = await axios.post<ProjetoMetricsSnapshotDTO>(
      `/projetos/${projetoId}/metrics/snapshots`,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Não tem permissão para criar este snapshot');
      } else if (error.response?.status === 404) {
        throw new Error('Projeto não encontrado');
      }
    }

    throw new Error('Erro ao criar snapshot. Por favor, tente novamente.');
  }
};

/**
 * Fetch the metrics snapshot history for a project, ordered by date ascending.
 */
export const getProjetoMetricsSnapshotsAPI = async (
  projetoId: number,
): Promise<ProjetoMetricsSnapshotDTO[]> => {
  try {
    const response = await axios.get<ProjetoMetricsSnapshotDTO[]>(
      `/projetos/${projetoId}/metrics/snapshots`,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new Error('Não tem permissão para visualizar este histórico');
    }

    throw new Error(
      'Erro ao carregar histórico de métricas. Por favor, tente novamente.',
    );
  }
};
