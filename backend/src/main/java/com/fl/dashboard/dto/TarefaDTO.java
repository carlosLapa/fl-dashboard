package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@ToString
public class TarefaDTO {

    private Long id;
    private String descricao;
    private String prioridade;
    private Date prazoEstimado;
    private Date prazoReal;

    public TarefaDTO() {
    }

    public TarefaDTO(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
    }

    public TarefaDTO(Tarefa entity) {
        id = entity.getId();
        descricao = entity.getDescricao();
        prioridade = entity.getPrioridade();
        prazoEstimado = entity.getPrazoEstimado();
        prazoReal = entity.getPrazoReal();
    }

}
