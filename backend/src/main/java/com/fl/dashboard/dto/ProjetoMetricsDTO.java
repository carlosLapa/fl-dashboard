package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjetoMetricsDTO {
    private Long projetoId;
    private String designacao;

    // KPIs gerais
    private Integer totalTarefas;
    private Integer tarefasConcluidas;
    private Integer tarefasEmProgresso;
    private Integer tarefasPendentes;
    private Double tempoMedioDias;
    private Double taxaConclusao; // Percentagem (0-100)

    // Datas do projeto
    private LocalDate primeiraDataInicio; // Data da primeira tarefa
    private LocalDate ultimaDataConclusao; // Data da última tarefa concluída

    // Distribuição por status
    private Map<String, Integer> tarefasPorStatus;

    // Top tarefas mais longas
    private List<TaskMetricsDTO> tarefasMaisLongas;

    // Métricas por colaborador
    private List<CollaboratorMetricsDTO> colaboradores;
    
    public ProjetoMetricsDTO(Long projetoId, String designacao) {
        this.projetoId = projetoId;
        this.designacao = designacao;
    }
}
