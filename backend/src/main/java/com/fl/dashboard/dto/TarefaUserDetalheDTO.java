package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.TarefaStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

/**
 * Per-task detail row for a single collaborator's task report: which task,
 * which project, and the working-days measurement used as the agreed proxy
 * for "time spent" (see Tarefa#workingDays).
 */
@Getter
@Setter
@NoArgsConstructor
public class TarefaUserDetalheDTO {

    private Long tarefaId;
    private String descricao;
    private Long projetoId;
    private String projetoDesignacao;
    private TarefaStatus status;
    private Date prazoEstimado;
    private Date prazoReal;
    private Integer workingDays;

    public TarefaUserDetalheDTO(Tarefa entity) {
        this.tarefaId = entity.getId();
        this.descricao = entity.getDescricao();
        if (entity.getProjeto() != null) {
            this.projetoId = entity.getProjeto().getId();
            this.projetoDesignacao = entity.getProjeto().getDesignacao();
        }
        this.status = entity.getStatus();
        this.prazoEstimado = entity.getPrazoEstimado();
        this.prazoReal = entity.getPrazoReal();
        this.workingDays = entity.getWorkingDays();
    }
}
