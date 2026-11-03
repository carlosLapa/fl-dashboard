package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// A requisição plus who holds it, for the conflict warning and the Equipamentos page. Built with a
// JPQL constructor expression so listing never hydrates User entities (and their profile images).
@Getter
@Setter
public class RequisicaoEquipamentoDetalheDTO {

    private Long id;
    private Long equipamentoId;
    private String equipamentoNome;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String observacoes;
    private Long tarefaId;
    private String tarefaDescricao;
    private String projetoDesignacao;
    private List<String> colaboradores = new ArrayList<>();
    private boolean conflito;

    public RequisicaoEquipamentoDetalheDTO(Long id, Long equipamentoId, String equipamentoNome, LocalDate dataInicio,
                                           LocalDate dataFim, String observacoes, Long tarefaId, String tarefaDescricao,
                                           String projetoDesignacao) {
        this.id = id;
        this.equipamentoId = equipamentoId;
        this.equipamentoNome = equipamentoNome;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.observacoes = observacoes;
        this.tarefaId = tarefaId;
        this.tarefaDescricao = tarefaDescricao;
        this.projetoDesignacao = projetoDesignacao;
    }
}
