import axios from './apiConfig';
import { ProjetoMetricsDTO } from '../types/projetoMetrics';

/**
 * Fetch comprehensive metrics for a specific project
 *
 * Requires VIEW_ALL_PROJECTS permission (Admin/Manager roles)
 * Returns aggregated metrics including:
 * - General KPIs (total, completed, in progress, pending tasks)
 * - Completion rate and average working days
 * - Status distribution
 * - Top 10 longest tasks
 * - Metrics per collaborator
 * - Project timeline (first start date, last completion date)
 *
 * @param projetoId The ID of the project to fetch metrics for
 * @returns Promise<ProjetoMetricsDTO> Complete metrics data
 * @throws Error if user doesn't have permission or project not found
 */
export const getProjetoMetricsAPI = async (
  projetoId: number,
): Promise<ProjetoMetricsDTO> => {
  try {
    console.log(`Fetching metrics for projeto ID: ${projetoId}`);

    const response = await axios.get<ProjetoMetricsDTO>(
      `/projetos/${projetoId}/metrics`,
    );

    console.log('Metrics data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching projeto metrics:', error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error(
          'Não tem permissão para visualizar estas métricas',
        );
      } else if (error.response?.status === 404) {
        throw new Error('Projeto não encontrado');
      }
    }

    throw new Error(
      'Erro ao carregar métricas do projeto. Por favor, tente novamente.',
    );
  }
};
