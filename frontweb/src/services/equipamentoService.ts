import {
  createEquipamentoAPI,
  getConflitosRequisicaoAPI,
  getEquipamentosAPI,
  getRequisicoesAPI,
  updateEquipamentoAPI,
} from 'api/equipamentoApi';
import {
  Equipamento,
  EquipamentoFormData,
  RequisicaoEquipamento,
  RequisicaoEquipamentoDetalhe,
} from 'types/equipamento';

export const getEquipamentos = async (
  incluirInativos = false,
): Promise<Equipamento[]> => getEquipamentosAPI(incluirInativos);

export const createEquipamento = async (
  data: EquipamentoFormData,
): Promise<Equipamento> => createEquipamentoAPI(data);

export const updateEquipamento = async (
  id: number,
  data: EquipamentoFormData,
): Promise<Equipamento> => updateEquipamentoAPI(id, data);

export const getRequisicoes = async (): Promise<
  RequisicaoEquipamentoDetalhe[]
> => getRequisicoesAPI();

export const getConflitosRequisicao = async (
  requisicao: RequisicaoEquipamento,
  excludeTarefaId?: number,
): Promise<RequisicaoEquipamentoDetalhe[]> =>
  getConflitosRequisicaoAPI(
    requisicao.equipamentoId,
    requisicao.dataInicio,
    requisicao.dataFim,
    excludeTarefaId,
  );

// Whether a row has everything the conflict check needs, in a valid order.
// 'yyyy-MM-dd' strings compare correctly as plain text.
export const isRequisicaoCompleta = (
  requisicao: RequisicaoEquipamento,
): boolean =>
  requisicao.equipamentoId > 0 &&
  !!requisicao.dataInicio &&
  !!requisicao.dataFim &&
  requisicao.dataInicio <= requisicao.dataFim;

// Client-side counterpart of the backend's save-time validation, returning the
// message to show, or null if the list can be saved.
export const validarRequisicoes = (
  requisicoes: RequisicaoEquipamento[],
): string | null => {
  for (let i = 0; i < requisicoes.length; i++) {
    const requisicao = requisicoes[i];
    if (!requisicao.equipamentoId) {
      return 'Selecione o equipamento em todas as requisições de material';
    }
    if (!requisicao.dataInicio || !requisicao.dataFim) {
      return 'Indique as datas de início e de fim em todas as requisições de material';
    }
    if (requisicao.dataInicio > requisicao.dataFim) {
      return 'A data de fim da requisição não pode ser anterior à data de início';
    }
    for (let j = i + 1; j < requisicoes.length; j++) {
      const outra = requisicoes[j];
      if (
        requisicao.equipamentoId === outra.equipamentoId &&
        requisicao.dataInicio <= outra.dataFim &&
        requisicao.dataFim >= outra.dataInicio
      ) {
        return 'O mesmo equipamento está requisitado em períodos sobrepostos nesta tarefa';
      }
    }
  }
  return null;
};
