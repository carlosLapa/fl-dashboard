package com.fl.dashboard.dto;

import com.fl.dashboard.entities.ProjetoMetricsSnapshot;
import com.fl.dashboard.enums.SnapshotTriggerType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProjetoMetricsSnapshotDTO {

    private Long id;
    private Long projetoId;
    private LocalDate snapshotDate;
    private Integer totalTarefas;
    private Integer tarefasConcluidas;
    private Integer tarefasEmProgresso;
    private Integer tarefasPendentes;
    private Double tempoMedioDias;
    private Double taxaConclusao;
    private SnapshotTriggerType triggerType;
    private UserSummaryDTO triggeredByUser;
    private LocalDateTime createdAt;

    public ProjetoMetricsSnapshotDTO() {
    }

    public ProjetoMetricsSnapshotDTO(ProjetoMetricsSnapshot entity) {
        this.id = entity.getId();
        this.projetoId = entity.getProjeto().getId();
        this.snapshotDate = entity.getSnapshotDate();
        this.totalTarefas = entity.getTotalTarefas();
        this.tarefasConcluidas = entity.getTarefasConcluidas();
        this.tarefasEmProgresso = entity.getTarefasEmProgresso();
        this.tarefasPendentes = entity.getTarefasPendentes();
        this.tempoMedioDias = entity.getTempoMedioDias();
        this.taxaConclusao = entity.getTaxaConclusao();
        this.triggerType = entity.getTriggerType();
        this.triggeredByUser = entity.getTriggeredByUser() != null
                ? new UserSummaryDTO(entity.getTriggeredByUser())
                : null;
        this.createdAt = entity.getCreatedAt();
    }
}
