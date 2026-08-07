package com.fl.dashboard.services;

import com.fl.dashboard.dto.CollaboratorGlobalMetricsDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.TarefaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Aggregates collaborator performance metrics across ALL projects
 * (as opposed to ProjetoMetricsService, which is scoped to a single project)
 */
@Service
public class ColaboradorReportService {

    private final TarefaRepository tarefaRepository;

    public ColaboradorReportService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
    }

    @Transactional(readOnly = true)
    public List<CollaboratorGlobalMetricsDTO> getGlobalCollaboratorMetrics() {
        List<Tarefa> tarefas = tarefaRepository.findAllActive();

        Map<User, List<Tarefa>> tarefasPorColaborador = new HashMap<>();
        for (Tarefa tarefa : tarefas) {
            for (User user : tarefa.getUsers()) {
                tarefasPorColaborador
                        .computeIfAbsent(user, k -> new ArrayList<>())
                        .add(tarefa);
            }
        }

        return tarefasPorColaborador.entrySet().stream()
                .map(entry -> buildMetrics(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(CollaboratorGlobalMetricsDTO::getTotalTarefas).reversed())
                .toList();
    }

    private CollaboratorGlobalMetricsDTO buildMetrics(User user, List<Tarefa> tarefasDoUser) {
        CollaboratorGlobalMetricsDTO dto = new CollaboratorGlobalMetricsDTO(
                user.getId(),
                user.getName()
        );

        long totalProjetos = tarefasDoUser.stream()
                .map(Tarefa::getProjeto)
                .filter(Objects::nonNull)
                .map(Projeto::getId)
                .distinct()
                .count();
        dto.setTotalProjetos((int) totalProjetos);

        int totalTarefas = tarefasDoUser.size();
        int tarefasConcluidas = TarefaMetricsCalculator.countByStatus(tarefasDoUser, TarefaStatus.DONE);
        int tarefasEmProgresso = TarefaMetricsCalculator.countByStatus(
                tarefasDoUser, TarefaStatus.IN_PROGRESS, TarefaStatus.IN_REVIEW);
        int tarefasPendentes = TarefaMetricsCalculator.countByStatus(
                tarefasDoUser, TarefaStatus.TODO, TarefaStatus.BACKLOG);

        dto.setTotalTarefas(totalTarefas);
        dto.setTarefasConcluidas(tarefasConcluidas);
        dto.setTarefasEmProgresso(tarefasEmProgresso);
        dto.setTarefasPendentes(tarefasPendentes);
        dto.setTempoMedioDias(TarefaMetricsCalculator.calculateAverageWorkingDays(tarefasDoUser));

        if (totalTarefas > 0) {
            double taxa = (tarefasConcluidas * 100.0) / totalTarefas;
            dto.setTaxaConclusao(Math.round(taxa * 100.0) / 100.0);
        }

        return dto;
    }
}
