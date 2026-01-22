package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CollaboratorMetricsDTO {
    private Long userId;
    private String nome;
    private Integer totalTarefas;
    private Integer tarefasConcluidas;
    private Integer tarefasEmProgresso;
    private Double tempoMedioDias;              // Média de workingDays das tarefas concluídas
    private Map<String, Integer> tarefasPorStatus; // Distribuição por status

    // Constructor personalizado (se necessário)
    public CollaboratorMetricsDTO(Long userId, String nome) {
        this.userId = userId;
        this.nome = nome;
    }
}