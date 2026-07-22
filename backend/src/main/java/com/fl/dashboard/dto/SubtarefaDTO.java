package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Subtarefa;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class SubtarefaDTO {

    private Long id;
    private Long tarefaId;
    private UserSummaryDTO user;
    private String descricao;
    private BigDecimal percentual;
    private boolean concluida;
    private LocalDateTime concluidaEm;

    public SubtarefaDTO() {
    }

    public SubtarefaDTO(Subtarefa entity) {
        this.id = entity.getId();
        this.tarefaId = entity.getTarefa().getId();
        this.user = new UserSummaryDTO(entity.getUser());
        this.descricao = entity.getDescricao();
        this.percentual = entity.getPercentual();
        this.concluida = entity.isConcluida();
        this.concluidaEm = entity.getConcluidaEm();
    }

}
