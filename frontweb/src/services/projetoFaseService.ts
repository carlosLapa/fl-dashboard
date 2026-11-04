import {
  createFaseAPI,
  deleteFaseAPI,
  getFasesByProjetoAPI,
  reordenarFasesAPI,
  updateFaseAPI,
} from 'api/projetoFaseApi';
import { ProjetoFase, ProjetoFaseFormData } from 'types/projetoFase';

export const getFasesByProjeto = async (
  projetoId: number,
): Promise<ProjetoFase[]> => getFasesByProjetoAPI(projetoId);

export const createFase = async (
  projetoId: number,
  data: ProjetoFaseFormData,
): Promise<ProjetoFase> => createFaseAPI(projetoId, normalizarFase(data));

export const updateFase = async (
  projetoId: number,
  faseId: number,
  data: ProjetoFaseFormData,
): Promise<ProjetoFase> =>
  updateFaseAPI(projetoId, faseId, normalizarFase(data));

export const deleteFase = async (
  projetoId: number,
  faseId: number,
): Promise<void> => deleteFaseAPI(projetoId, faseId);

// Moves the phase at `index` one step up (-1) or down (+1) and returns the
// projeto's full phase-id list in the new order, or null if it can't move.
export const moverFase = (
  fases: ProjetoFase[],
  index: number,
  direcao: -1 | 1,
): number[] | null => {
  const destino = index + direcao;
  if (destino < 0 || destino >= fases.length) {
    return null;
  }
  const ids = fases.map((fase) => fase.id);
  [ids[index], ids[destino]] = [ids[destino], ids[index]];
  return ids;
};

export const reordenarFases = async (
  projetoId: number,
  faseIds: number[],
): Promise<ProjetoFase[]> => reordenarFasesAPI(projetoId, faseIds);

// Client-side counterpart of the backend's validation, returning the message
// to show, or null if the phase can be saved.
export const validarFase = (data: ProjetoFaseFormData): string | null => {
  if (!data.nome.trim()) {
    return 'Indique o nome da fase';
  }
  if (data.nome.trim().length > 100) {
    return 'O nome da fase não pode ter mais de 100 caracteres';
  }
  // 'yyyy-MM-dd' strings compare correctly as plain text.
  if (data.dataInicio && data.dataFim && data.dataFim < data.dataInicio) {
    return 'A data de fim da fase não pode ser anterior à data de início';
  }
  return null;
};

// 'yyyy-MM-dd' -> 'dd/MM/yyyy' without going through Date, which would parse
// it as UTC midnight and can show the previous day in some timezones.
export const formatarDataFase = (data?: string | null): string => {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
};

// Empty form fields go to the backend as null, not '' (which LocalDate can't parse).
const normalizarFase = (data: ProjetoFaseFormData): ProjetoFaseFormData => ({
  nome: data.nome.trim(),
  descricao: data.descricao?.trim() || null,
  dataInicio: data.dataInicio || null,
  dataFim: data.dataFim || null,
});
