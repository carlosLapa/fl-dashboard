package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * DTO for collaborator performance metrics within a project
 * Field names align with frontend TypeScript interface (projetoMetrics.ts)
 * to ensure seamless JSON serialization/deserialization
 * <p>
 * Used by ProjetoMetricsDTO to represent individual collaborator statistics
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorMetricsDTO {

    /**
     * User ID of the collaborator
     * Mapped from User entity ID
     */
    private Long colaboradorId;

    /**
     * Full name of the collaborator
     * Defaults to "Desconhecido" if null (see service layer)
     */
    private String colaboradorNome;

    /**
     * Total tasks assigned to this collaborator in the project
     * Includes all statuses (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE)
     */
    private Integer totalTarefas;

    /**
     * Number of tasks marked as DONE
     */
    private Integer tarefasConcluidas;

    /**
     * Number of tasks currently in IN_PROGRESS or IN_REVIEW status
     */
    private Integer tarefasEmProgresso;

    /**
     * Number of tasks pending (TODO + BACKLOG)
     * Added to match frontend interface
     */
    private Integer tarefasPendentes;

    /**
     * Average working days to complete tasks
     * Calculated only from completed tasks (status DONE) with valid workingDays
     * Rounded to 1 decimal place
     */
    private Double tempoMedioDias;

    /**
     * Distribution of tasks by status
     * Map key: status name (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, DONE)
     * Map value: count of tasks in that status
     */
    private Map<String, Integer> tarefasPorStatus;

    /**
     * Constructor for initialization with basic user info
     * Useful when creating metrics before aggregating task data
     *
     * @param colaboradorId   User ID
     * @param colaboradorNome User full name (validated non-null in service layer)
     */
    public CollaboratorMetricsDTO(Long colaboradorId, String colaboradorNome) {
        this.colaboradorId = colaboradorId;
        this.colaboradorNome = colaboradorNome != null ? colaboradorNome : "Desconhecido";
        this.totalTarefas = 0;
        this.tarefasConcluidas = 0;
        this.tarefasEmProgresso = 0;
        this.tarefasPendentes = 0; // Initialize to 0
        this.tempoMedioDias = 0.0;
    }
}