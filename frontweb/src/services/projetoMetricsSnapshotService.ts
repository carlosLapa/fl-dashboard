import {
  createProjetoMetricsSnapshotAPI,
  getProjetoMetricsSnapshotsAPI,
} from '../api/projetoMetricsSnapshotApi';
import { ProjetoMetricsSnapshotDTO } from '../types/projetoMetricsSnapshot';

export const createProjetoMetricsSnapshot = async (
  projetoId: number,
): Promise<ProjetoMetricsSnapshotDTO> => {
  return createProjetoMetricsSnapshotAPI(projetoId);
};

export const getProjetoMetricsSnapshots = async (
  projetoId: number,
): Promise<ProjetoMetricsSnapshotDTO[]> => {
  return getProjetoMetricsSnapshotsAPI(projetoId);
};
