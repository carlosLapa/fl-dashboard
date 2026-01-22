package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskMetricsDTO {
    private Long tarefaId;
    private String descricao;
    private String prioridade;
    private LocalDate dataInicio;      // prazoEstimado no modelo Tarefa
    private LocalDate dataFim;         // prazoReal no modelo Tarefa
    private Integer workingDays;       // Dias úteis de duração
    private String status;
    private List<String> colaboradores; // Nomes dos users atribuídos

    // Constructor personalizado (se necessário)
    public TaskMetricsDTO(Long tarefaId, String descricao, String prioridade,
                          LocalDate dataInicio, LocalDate dataFim,
                          Integer workingDays, String status) {
        this.tarefaId = tarefaId;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.workingDays = workingDays;
        this.status = status;
    }
}
