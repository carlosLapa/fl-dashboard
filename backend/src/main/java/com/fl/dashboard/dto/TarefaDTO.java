package com.fl.dashboard.dto;

public class TarefaDTO {

    private Long id;
    private String descricao;
    private String prioridade;

    public TarefaDTO() {
    }

    public TarefaDTO(Long id, String descricao, String prioridade) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
    }
}
