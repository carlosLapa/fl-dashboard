import { getColaboradorGlobalMetricsAPI } from '../api/colaboradorReportApi';
import { CollaboratorGlobalMetricsDTO } from '../types/colaboradorReport';

export const getColaboradorGlobalMetrics = async (): Promise<
  CollaboratorGlobalMetricsDTO[]
> => {
  return getColaboradorGlobalMetricsAPI();
};
