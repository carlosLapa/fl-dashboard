package com.fl.dashboard.services;

import com.fl.dashboard.dto.CollaboratorMetricsDTO;
import com.fl.dashboard.dto.ProjetoMetricsDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@Tag("unit")
@DisplayName("Projeto Metrics Service - total time tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProjetoMetricsServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private ProjetoService projetoService;

    @InjectMocks
    private ProjetoMetricsService projetoMetricsService;

    private static User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }

    private static Tarefa tarefa(Long id, Projeto projeto, Integer workingDays, User... users) {
        Tarefa tarefa = new Tarefa();
        tarefa.setId(id);
        tarefa.setStatus(TarefaStatus.DONE);
        tarefa.setProjeto(projeto);
        tarefa.setWorkingDays(workingDays);
        tarefa.getUsers().addAll(List.of(users));
        return tarefa;
    }

    private static Projeto projeto(Long id) {
        Projeto projeto = new Projeto();
        projeto.setId(id);
        projeto.setDesignacao("Projeto " + id);
        return projeto;
    }

    @Test
    @DisplayName("Project total is person-days: a shared task counts in full for each collaborator")
    void totalIsSumOfPerCollaboratorTotals() {
        Projeto projeto = projeto(1L);
        User ana = user(10L, "Ana");
        User rui = user(11L, "Rui");

        // 5 days shared by Ana+Rui = 10 person-days; 3 days Ana only = 3
        Tarefa shared = tarefa(1L, projeto, 5, ana, rui);
        Tarefa anaOnly = tarefa(2L, projeto, 3, ana);

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(tarefaRepository.findAllActive()).thenReturn(List.of(shared, anaOnly));

        ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(1L);

        assertEquals(13, metrics.getTempoTotalDias());
        assertEquals(0, metrics.getTarefasNaoContadas());

        int columnSum = metrics.getColaboradores().stream()
                .mapToInt(CollaboratorMetricsDTO::getTempoTotalDias)
                .sum();
        assertEquals(metrics.getTempoTotalDias(), columnSum);

        CollaboratorMetricsDTO anaMetrics = metrics.getColaboradores().stream()
                .filter(c -> c.getColaboradorId().equals(10L))
                .findFirst().orElseThrow();
        assertEquals(8, anaMetrics.getTempoTotalDias());
    }

    @Test
    @DisplayName("Tasks without dates or without collaborators add 0 and are counted as not counted")
    void tasksWithoutDatesOrCollaboratorsAreReportedNotCounted() {
        Projeto projeto = projeto(1L);
        User ana = user(10L, "Ana");

        Tarefa counted = tarefa(1L, projeto, 4, ana);
        Tarefa noDates = tarefa(2L, projeto, null, ana);
        Tarefa noCollaborator = tarefa(3L, projeto, 7);

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(tarefaRepository.findAllActive()).thenReturn(List.of(counted, noDates, noCollaborator));

        ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(1L);

        assertEquals(4, metrics.getTempoTotalDias());
        assertEquals(2, metrics.getTarefasNaoContadas());
    }

    @Test
    @DisplayName("Project with no tasks has a total of 0 and nothing left out")
    void projectWithoutTasksHasZeroTotal() {
        Projeto projeto = projeto(1L);

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(tarefaRepository.findAllActive()).thenReturn(List.of());

        ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(1L);

        assertEquals(0, metrics.getTempoTotalDias());
        assertEquals(0, metrics.getTarefasNaoContadas());
    }
}
