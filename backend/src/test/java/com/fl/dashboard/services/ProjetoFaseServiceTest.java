package com.fl.dashboard.services;

import com.fl.dashboard.dto.ProjetoFaseDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.ProjetoFase;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.repositories.ProjetoFaseRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.services.exceptions.FaseInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProjetoFaseServiceTest {

    @Mock
    private ProjetoFaseRepository faseRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @InjectMocks
    private ProjetoFaseService faseService;

    private Projeto projeto;

    @BeforeEach
    void setUp() {
        projeto = new Projeto();
        projeto.setId(5L);
        when(projetoRepository.findByIdActive(5L)).thenReturn(Optional.of(projeto));
        when(faseRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private ProjetoFase fase(Long id, int ordem) {
        ProjetoFase fase = new ProjetoFase();
        fase.setId(id);
        fase.setProjeto(projeto);
        fase.setNome("Fase " + id);
        fase.setOrdem(ordem);
        return fase;
    }

    private ProjetoFaseDTO dto(String nome, LocalDate inicio, LocalDate fim) {
        ProjetoFaseDTO dto = new ProjetoFaseDTO();
        dto.setNome(nome);
        dto.setDataInicio(inicio);
        dto.setDataFim(fim);
        return dto;
    }

    @Test
    void insertShouldRejectDataFimBeforeDataInicio() {
        ProjetoFaseDTO dto = dto("Design Freeze", LocalDate.of(2027, 2, 1), LocalDate.of(2027, 1, 1));

        assertThrows(FaseInvalidaException.class, () -> faseService.insert(5L, dto));
        verify(faseRepository, never()).save(any());
    }

    @Test
    void insertShouldAcceptPhaseWithoutDates() {
        when(faseRepository.findMaxOrdem(5L)).thenReturn(-1);

        ProjetoFaseDTO result = faseService.insert(5L, dto("  Design Freeze  ", null, null));

        assertEquals("Design Freeze", result.getNome());
        assertEquals(0, result.getOrdem());
        assertNull(result.getDataInicio());
    }

    @Test
    void insertShouldAppendAfterLastPhaseWhenOrdemMissing() {
        when(faseRepository.findMaxOrdem(5L)).thenReturn(3);

        ProjetoFaseDTO result = faseService.insert(5L, dto("Civil Works", null, null));

        assertEquals(4, result.getOrdem());
    }

    @Test
    void reordenarShouldApplyNewOrder() {
        ProjetoFase a = fase(1L, 0);
        ProjetoFase b = fase(2L, 1);
        when(faseRepository.findByProjetoIdOrdered(5L)).thenReturn(List.of(a, b));

        faseService.reordenar(5L, List.of(2L, 1L));

        assertEquals(1, a.getOrdem());
        assertEquals(0, b.getOrdem());
    }

    @Test
    void reordenarShouldRejectIncompleteOrForeignList() {
        when(faseRepository.findByProjetoIdOrdered(5L)).thenReturn(List.of(fase(1L, 0), fase(2L, 1)));

        assertThrows(FaseInvalidaException.class, () -> faseService.reordenar(5L, List.of(1L)));
        assertThrows(FaseInvalidaException.class, () -> faseService.reordenar(5L, List.of(1L, 1L)));
        assertThrows(FaseInvalidaException.class, () -> faseService.reordenar(5L, List.of(1L, 99L)));
        verify(faseRepository, never()).saveAll(any());
    }

    @Test
    void deleteShouldUnlinkTarefasBeforeDeletingPhase() {
        ProjetoFase fase = fase(1L, 0);
        when(faseRepository.findByIdAndProjetoId(1L, 5L)).thenReturn(Optional.of(fase));

        faseService.delete(5L, 1L);

        var inOrder = inOrder(faseRepository);
        inOrder.verify(faseRepository).desassociarTarefas(1L);
        inOrder.verify(faseRepository).delete(fase);
    }

    @Test
    void resolverFaseParaTarefaShouldRejectPhaseFromAnotherProjeto() {
        Tarefa tarefa = new Tarefa();
        tarefa.setProjeto(projeto);
        when(faseRepository.findByIdAndProjetoId(77L, 5L)).thenReturn(Optional.empty());

        assertThrows(FaseInvalidaException.class, () -> faseService.resolverFaseParaTarefa(tarefa, 77L));
    }

    @Test
    void resolverFaseParaTarefaShouldRejectTarefaWithoutProjeto() {
        assertThrows(FaseInvalidaException.class, () -> faseService.resolverFaseParaTarefa(new Tarefa(), 1L));
    }

    @Test
    void resolverFaseParaTarefaShouldReturnNullWhenNoFase() {
        assertNull(faseService.resolverFaseParaTarefa(new Tarefa(), null));
    }
}
