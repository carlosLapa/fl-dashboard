import axios from './apiConfig';
import {
  Equipamento,
  EquipamentoFormData,
  RequisicaoEquipamentoDetalhe,
} from '../types/equipamento';

export const getEquipamentosAPI = async (
  incluirInativos = false,
): Promise<Equipamento[]> => {
  const response = await axios.get<Equipamento[]>('/equipamentos', {
    params: { incluirInativos },
  });
  return response.data;
};

const toEquipamentoError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors?.[0]?.message) {
      return new Error(data.errors[0].message);
    }
    // The backend's DatabaseException handler carries its text in `error`, not `message`.
    if (data?.message || data?.error) {
      return new Error(data.message || data.error);
    }
  }
  return new Error(fallback);
};

export const createEquipamentoAPI = async (
  data: EquipamentoFormData,
): Promise<Equipamento> => {
  try {
    const response = await axios.post<Equipamento>('/equipamentos', data);
    return response.data;
  } catch (error) {
    throw toEquipamentoError(error, 'Erro ao criar o equipamento.');
  }
};

export const updateEquipamentoAPI = async (
  id: number,
  data: EquipamentoFormData,
): Promise<Equipamento> => {
  try {
    const response = await axios.put<Equipamento>(`/equipamentos/${id}`, data);
    return response.data;
  } catch (error) {
    throw toEquipamentoError(error, 'Erro ao atualizar o equipamento.');
  }
};

export const getRequisicoesAPI = async (): Promise<
  RequisicaoEquipamentoDetalhe[]
> => {
  const response =
    await axios.get<RequisicaoEquipamentoDetalhe[]>('/requisicoes');
  return response.data;
};

export const getConflitosRequisicaoAPI = async (
  equipamentoId: number,
  dataInicio: string,
  dataFim: string,
  excludeTarefaId?: number,
): Promise<RequisicaoEquipamentoDetalhe[]> => {
  const response = await axios.get<RequisicaoEquipamentoDetalhe[]>(
    '/requisicoes/conflitos',
    { params: { equipamentoId, dataInicio, dataFim, excludeTarefaId } },
  );
  return response.data;
};
