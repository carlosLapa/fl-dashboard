package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.TarefaStatus;
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
    private TarefaStatus status;

    public TarefaDTO() {
    }

    public TarefaDTO(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal, TarefaStatus status) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
        this.status = status;
    }

    public TarefaDTO(Tarefa entity) {
        this.id = entity.getId();
        this.descricao = entity.getDescricao();
        this.prioridade = entity.getPrioridade();
        this.prazoEstimado = entity.getPrazoEstimado();
        this.prazoReal = entity.getPrazoReal();
        this.status = entity.getStatus();
    }

}
