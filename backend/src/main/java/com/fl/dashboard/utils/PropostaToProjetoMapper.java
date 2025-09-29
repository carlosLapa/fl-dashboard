package com.fl.dashboard.utils;

import com.fl.dashboard.entities.Proposta;
import com.fl.dashboard.entities.Projeto;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class PropostaToProjetoMapper {

    public Projeto convert(Proposta proposta) {
        Projeto projeto = new Projeto();

        // Copia os campos comuns usando o utilitário
        PropostaProjetoMapperUtil.copyPropostaFieldsToProjeto(proposta, projeto);

        // Adiciona o primeiro cliente da lista (ou adapte para múltiplos se necessário)
        if (proposta.getClientes() != null && !proposta.getClientes().isEmpty()) {
            projeto.setCliente(proposta.getClientes().iterator().next());
        }

        // Inicializa coleções vazias se necessário
        projeto.setColunas(new java.util.ArrayList<>());
        projeto.setExternos(new HashSet<>());
        projeto.setTarefas(new HashSet<>());

        return projeto;
    }
}
