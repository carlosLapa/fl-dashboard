import axios from './apiConfig';
import { ProjetoFase, ProjetoFaseFormData } from '../types/projetoFase';

// Surfaces the backend's own message (FaseInvalidaException, @Valid field errors)
// instead of a generic one, so the user sees e.g. which date is wrong.
const toFaseError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors?.[0]?.message) {
      return new Error(data.errors[0].message);
    }
    if (data?.message) {
      return new Error(data.message);
    }
  }
  return new Error(fallback);
};

export const getFasesByProjetoAPI = async (
  projetoId: number,
): Promise<ProjetoFase[]> => {
  const response = await axios.get<ProjetoFase[]>(`/projetos/${projetoId}/fases`);
  // The global interceptor turns a 403/404 on any '/projetos' URL into a
  // paginated-shape object instead of throwing; treat that as "no phases".
  return Array.isArray(response.data) ? response.data : [];
};

export const createFaseAPI = async (
  projetoId: number,
  data: ProjetoFaseFormData,
): Promise<ProjetoFase> => {
  try {
    const response = await axios.post<ProjetoFase>(
      `/projetos/${projetoId}/fases`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toFaseError(error, 'Erro ao criar a fase.');
  }
};

export const updateFaseAPI = async (
  projetoId: number,
  faseId: number,
  data: ProjetoFaseFormData,
): Promise<ProjetoFase> => {
  try {
    const response = await axios.put<ProjetoFase>(
      `/projetos/${projetoId}/fases/${faseId}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw toFaseError(error, 'Erro ao atualizar a fase.');
  }
};

export const deleteFaseAPI = async (
  projetoId: number,
  faseId: number,
): Promise<void> => {
  try {
    await axios.delete(`/projetos/${projetoId}/fases/${faseId}`);
  } catch (error) {
    throw toFaseError(error, 'Erro ao apagar a fase.');
  }
};

export const reordenarFasesAPI = async (
  projetoId: number,
  faseIds: number[],
): Promise<ProjetoFase[]> => {
  try {
    const response = await axios.put<ProjetoFase[]>(
      `/projetos/${projetoId}/fases/ordem`,
      faseIds,
    );
    return response.data;
  } catch (error) {
    throw toFaseError(error, 'Erro ao reordenar as fases.');
  }
};
