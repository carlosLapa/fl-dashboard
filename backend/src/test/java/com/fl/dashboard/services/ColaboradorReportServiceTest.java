package com.fl.dashboard.services;

import com.fl.dashboard.dto.TarefaUserDetalheDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.TarefaStatus;
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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@Tag("unit")
@DisplayName("Colaborador Report Service Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ColaboradorReportServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @InjectMocks
    private ColaboradorReportService colaboradorReportService;

    private static Date date(int year, int month, int day) {
        Calendar cal = Calendar.getInstance();
        cal.set(year, month, day, 0, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);
        return cal.getTime();
    }

    private static Tarefa buildTarefa(Long id, Projeto projeto, Date prazoEstimado, Date prazoReal, Integer workingDays) {
        Tarefa tarefa = new Tarefa();
        tarefa.setId(id);
        tarefa.setDescricao("Tarefa " + id);
        tarefa.setStatus(TarefaStatus.DONE);
        tarefa.setProjeto(projeto);
        tarefa.setPrazoEstimado(prazoEstimado);
        tarefa.setPrazoReal(prazoReal);
        tarefa.setWorkingDays(workingDays);
        return tarefa;
    }

    @Test
    @DisplayName("Maps fields across multiple projects and sorts by prazoEstimado descending")
    void getTarefaDetailsForUser_mapsAndSortsAcrossProjects() {
        Projeto projetoA = new Projeto();
        projetoA.setId(1L);
        projetoA.setDesignacao("Projeto A");

        Projeto projetoB = new Projeto();
        projetoB.setId(2L);
        projetoB.setDesignacao("Projeto B");

        Tarefa older = buildTarefa(1L, projetoA, date(2026, Calendar.JANUARY, 5), date(2026, Calendar.JANUARY, 10), 4);
        Tarefa newer = buildTarefa(2L, projetoB, date(2026, Calendar.MARCH, 1), date(2026, Calendar.MARCH, 3), 2);

        when(tarefaRepository.findAllActiveByUserId(10L)).thenReturn(List.of(older, newer));

        List<TarefaUserDetalheDTO> result = colaboradorReportService.getTarefaDetailsForUser(10L);

        assertEquals(2, result.size());
        assertEquals(2L, result.get(0).getTarefaId());
        assertEquals("Projeto B", result.get(0).getProjetoDesignacao());
        assertEquals(1L, result.get(1).getTarefaId());
        assertEquals("Projeto A", result.get(1).getProjetoDesignacao());
        assertEquals(4, result.get(1).getWorkingDays());
    }

    @Test
    @DisplayName("Tasks with a null prazoEstimado sort last and keep a null workingDays")
    void getTarefaDetailsForUser_nullPrazoEstimadoSortsLastAndWorkingDaysStaysNull() {
        Projeto projeto = new Projeto();
        projeto.setId(1L);
        projeto.setDesignacao("Projeto A");

        Tarefa withDate = buildTarefa(1L, projeto, date(2026, Calendar.JANUARY, 5), date(2026, Calendar.JANUARY, 10), 4);
        Tarefa withoutDate = buildTarefa(2L, projeto, null, null, null);

        when(tarefaRepository.findAllActiveByUserId(10L)).thenReturn(List.of(withoutDate, withDate));

        List<TarefaUserDetalheDTO> result = colaboradorReportService.getTarefaDetailsForUser(10L);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getTarefaId());
        assertEquals(2L, result.get(1).getTarefaId());
        assertNull(result.get(1).getWorkingDays());
    }

    @Test
    @DisplayName("Returns an empty list without error when the collaborator has no active tasks")
    void getTarefaDetailsForUser_noTasksReturnsEmptyList() {
        when(tarefaRepository.findAllActiveByUserId(10L)).thenReturn(new ArrayList<>());

        List<TarefaUserDetalheDTO> result = colaboradorReportService.getTarefaDetailsForUser(10L);

        assertTrue(result.isEmpty());
    }
}
