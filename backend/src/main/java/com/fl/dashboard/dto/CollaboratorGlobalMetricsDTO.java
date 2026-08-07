package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for collaborator performance metrics aggregated across ALL projects
 * (as opposed to CollaboratorMetricsDTO, which is scoped to a single project)
 */
@Getter
@Setter
@NoArgsConstructor
public class CollaboratorGlobalMetricsDTO {

    private Long colaboradorId;
    private String colaboradorNome;

    /**
     * Number of distinct projects with at least one active task assigned to this collaborator
     */
    private Integer totalProjetos;

    private Integer totalTarefas;
    private Integer tarefasConcluidas;
    private Integer tarefasEmProgresso;
    private Integer tarefasPendentes;
    private Double tempoMedioDias;
    private Double taxaConclusao;

    public CollaboratorGlobalMetricsDTO(Long colaboradorId, String colaboradorNome) {
        this.colaboradorId = colaboradorId;
        this.colaboradorNome = colaboradorNome != null ? colaboradorNome : "Desconhecido";
        this.totalProjetos = 0;
        this.totalTarefas = 0;
        this.tarefasConcluidas = 0;
        this.tarefasEmProgresso = 0;
        this.tarefasPendentes = 0;
        this.tempoMedioDias = 0.0;
        this.taxaConclusao = 0.0;
    }
}
