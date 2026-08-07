package com.fl.dashboard.services;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.TarefaStatus;

import java.util.List;
import java.util.OptionalDouble;
import java.util.Set;

/**
 * Shared status-counting / working-days rules used by both per-project
 * (ProjetoMetricsService) and cross-project (ColaboradorReportService) metrics,
 * so the two never drift apart on what counts as "concluded" or "average days".
 */
final class TarefaMetricsCalculator {

    private TarefaMetricsCalculator() {
    }

    static int countByStatus(List<Tarefa> tarefas, TarefaStatus... statuses) {
        Set<TarefaStatus> statusSet = Set.of(statuses);
        return (int) tarefas.stream()
                .filter(t -> statusSet.contains(t.getStatus()))
                .count();
    }

    static double calculateAverageWorkingDays(List<Tarefa> tarefas) {
        OptionalDouble average = tarefas.stream()
                .filter(t -> TarefaStatus.DONE.equals(t.getStatus()) && t.getWorkingDays() != null)
                .mapToInt(Tarefa::getWorkingDays)
                .average();

        return average.isPresent() ? average.getAsDouble() : 0.0;
    }
}
