package com.fl.dashboard.utils;

import com.fl.dashboard.dto.PropostaDTO;
import com.fl.dashboard.entities.Proposta;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.enums.TipoProjeto;

public class PropostaProjetoMapperUtil {

    // Copia campos de Proposta para Projeto
    public static void copyPropostaFieldsToProjeto(Proposta proposta, Projeto projeto) {
        projeto.setProjetoAno(proposta.getPropostaAno());
        projeto.setDesignacao(proposta.getDesignacao());
        projeto.setPrioridade(proposta.getPrioridade());
        projeto.setObservacao(proposta.getObservacao());
        projeto.setPrazo(proposta.getPrazo());
        projeto.setStatus(proposta.getStatus());
        projeto.setDataProposta(proposta.getDataProposta());
        projeto.setDataAdjudicacao(proposta.getDataAdjudicacao());
        projeto.setTipo(proposta.getTipo() != null ? TipoProjeto.valueOf(proposta.getTipo()) : null);
    }

    // Copia campos de PropostaDTO para Proposta
    public static void copyDTOtoProposta(PropostaDTO dto, Proposta entity) {
        entity.setPropostaAno(dto.getPropostaAno());
        entity.setDesignacao(dto.getDesignacao());
        entity.setPrioridade(dto.getPrioridade());
        entity.setObservacao(dto.getObservacao());
        entity.setPrazo(dto.getPrazo());
        entity.setStatus(dto.getStatus());
        entity.setDataProposta(dto.getDataProposta());
        entity.setDataAdjudicacao(dto.getDataAdjudicacao());
        entity.setTipo(dto.getTipo());
        // Adicione outros campos se necessário
    }
}
