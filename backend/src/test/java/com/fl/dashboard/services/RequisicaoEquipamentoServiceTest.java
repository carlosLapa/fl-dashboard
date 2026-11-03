package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.RequisicaoEquipamentoDTO;
import com.fl.dashboard.dto.RequisicaoEquipamentoDetalheDTO;
import com.fl.dashboard.entities.Equipamento;
import com.fl.dashboard.entities.RequisicaoEquipamento;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.EquipamentoRepository;
import com.fl.dashboard.repositories.RequisicaoEquipamentoRepository;
import com.fl.dashboard.services.exceptions.RequisicaoInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Requisicao Equipamento Service Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class RequisicaoEquipamentoServiceTest {

    private static final LocalDate AMANHA = LocalDate.now().plusDays(1);

    @Mock
    private RequisicaoEquipamentoRepository requisicaoRepository;

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private RequisicaoEquipamentoService service;

    private Tarefa tarefa;
    private Equipamento carrinha;

    @BeforeEach
    void setUp() {
        tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Levantamento");

        carrinha = new Equipamento();
        carrinha.setId(5L);
        carrinha.setNome("Carrinha");
        when(equipamentoRepository.findById(5L)).thenReturn(Optional.of(carrinha));
    }

    private RequisicaoEquipamentoDTO dto(Long id, Long equipamentoId, LocalDate inicio, LocalDate fim) {
        RequisicaoEquipamentoDTO dto = new RequisicaoEquipamentoDTO();
        dto.setId(id);
        dto.setEquipamentoId(equipamentoId);
        dto.setDataInicio(inicio);
        dto.setDataFim(fim);
        return dto;
    }

    private RequisicaoEquipamento existente(Long id, LocalDate inicio, LocalDate fim) {
        RequisicaoEquipamento requisicao = new RequisicaoEquipamento();
        requisicao.setId(id);
        requisicao.setTarefa(tarefa);
        requisicao.setEquipamento(carrinha);
        requisicao.setDataInicio(inicio);
        requisicao.setDataFim(fim);
        tarefa.getRequisicoes().add(requisicao);
        return requisicao;
    }

    private RequisicaoEquipamentoDetalheDTO detalhe(Long tarefaId, LocalDate inicio, LocalDate fim) {
        return new RequisicaoEquipamentoDetalheDTO(100L + tarefaId, 5L, "Carrinha", inicio, fim, null,
                tarefaId, "Tarefa " + tarefaId, "Projeto");
    }

    // --- syncRequisicoes ---

    @Test
    void syncShouldLeaveRequisicoesUntouchedWhenFieldNotSent() {
        existente(10L, AMANHA, AMANHA);

        List<RequisicaoEquipamento> alteradas = service.syncRequisicoes(tarefa, null);

        assertTrue(alteradas.isEmpty());
        assertEquals(1, tarefa.getRequisicoes().size());
    }

    @Test
    void syncShouldAddKeepAndRemoveAndReportOnlyChangedOnes() {
        RequisicaoEquipamento inalterada = existente(10L, AMANHA, AMANHA);
        existente(20L, AMANHA.plusDays(5), AMANHA.plusDays(5));

        RequisicaoEquipamentoDTO manter = dto(10L, 5L, AMANHA, AMANHA);
        manter.setObservacoes("Só observações mudaram");
        RequisicaoEquipamentoDTO nova = dto(null, 5L, AMANHA.plusDays(10), AMANHA.plusDays(11));

        List<RequisicaoEquipamento> alteradas = service.syncRequisicoes(tarefa, List.of(manter, nova));

        assertEquals(2, tarefa.getRequisicoes().size());
        assertTrue(tarefa.getRequisicoes().contains(inalterada));
        assertEquals("Só observações mudaram", inalterada.getObservacoes());
        assertEquals(1, alteradas.size());
        assertEquals(AMANHA.plusDays(10), alteradas.get(0).getDataInicio());
        assertSame(tarefa, alteradas.get(0).getTarefa());
    }

    @Test
    void syncShouldReportExistingRequisicaoWhenPeriodChanges() {
        existente(10L, AMANHA, AMANHA);

        List<RequisicaoEquipamento> alteradas = service.syncRequisicoes(tarefa,
                List.of(dto(10L, 5L, AMANHA, AMANHA.plusDays(1))));

        assertEquals(1, alteradas.size());
    }

    @Test
    void syncShouldRejectEndBeforeStart() {
        List<RequisicaoEquipamentoDTO> dtos = List.of(dto(null, 5L, AMANHA, AMANHA.minusDays(1)));

        assertThrows(RequisicaoInvalidaException.class, () -> service.syncRequisicoes(tarefa, dtos));
    }

    @Test
    void syncShouldRejectSameEquipamentoOverlappingWithinTheTarefa() {
        List<RequisicaoEquipamentoDTO> dtos = List.of(
                dto(null, 5L, AMANHA, AMANHA.plusDays(2)),
                dto(null, 5L, AMANHA.plusDays(2), AMANHA.plusDays(3)));

        assertThrows(RequisicaoInvalidaException.class, () -> service.syncRequisicoes(tarefa, dtos));
    }

    @Test
    void syncShouldRejectNewRequisicaoOfDeactivatedEquipamento() {
        carrinha.setAtivo(false);
        List<RequisicaoEquipamentoDTO> dtos = List.of(dto(null, 5L, AMANHA, AMANHA));

        assertThrows(RequisicaoInvalidaException.class, () -> service.syncRequisicoes(tarefa, dtos));
    }

    @Test
    void syncShouldKeepExistingRequisicaoWhenEquipamentoWasDeactivatedLater() {
        existente(10L, AMANHA, AMANHA);
        carrinha.setAtivo(false);

        assertDoesNotThrow(() -> service.syncRequisicoes(tarefa, List.of(dto(10L, 5L, AMANHA, AMANHA))));
    }

    // --- findAtuaisEFuturas ---

    @Test
    void findAtuaisEFuturasShouldFlagOnlyOverlapsBetweenDifferentTarefas() {
        RequisicaoEquipamentoDetalheDTO a = detalhe(1L, AMANHA, AMANHA.plusDays(2));
        RequisicaoEquipamentoDetalheDTO b = detalhe(2L, AMANHA.plusDays(2), AMANHA.plusDays(3));
        RequisicaoEquipamentoDetalheDTO semConflito = detalhe(3L, AMANHA.plusDays(10), AMANHA.plusDays(11));
        when(requisicaoRepository.findAtivasDesde(any())).thenReturn(new ArrayList<>(List.of(a, b, semConflito)));

        service.findAtuaisEFuturas();

        assertTrue(a.isConflito());
        assertTrue(b.isConflito());
        assertFalse(semConflito.isConflito());
    }

    // --- notificarConflitos ---

    @Test
    void notificarShouldTellColaboradoresOfTheOtherTarefa() {
        RequisicaoEquipamento requisicao = existente(10L, AMANHA, AMANHA);
        when(requisicaoRepository.findConflitos(5L, AMANHA, AMANHA, 1L))
                .thenReturn(List.of(detalhe(2L, AMANHA, AMANHA)));
        when(requisicaoRepository.findColaboradoresByTarefaIds(anyCollection()))
                .thenReturn(List.<Object[]>of(new Object[]{2L, 7L, "Ana"}));

        service.notificarConflitos(tarefa, List.of(requisicao));

        ArgumentCaptor<NotificationInsertDTO> captor = ArgumentCaptor.forClass(NotificationInsertDTO.class);
        verify(notificationService).processNotification(captor.capture());
        assertEquals(NotificationType.REQUISICAO_CONFLITO.name(), captor.getValue().getType());
        assertEquals(7L, captor.getValue().getUserId());
        assertEquals(2L, captor.getValue().getTarefaId());
        assertTrue(captor.getValue().getContent().contains("Carrinha"));
    }

    @Test
    void notificarShouldStayQuietWhenTarefaIsAlreadyDone() {
        RequisicaoEquipamento requisicao = existente(10L, AMANHA, AMANHA);
        tarefa.setStatus(TarefaStatus.DONE);

        service.notificarConflitos(tarefa, List.of(requisicao));

        verifyNoInteractions(notificationService);
    }

    @Test
    void notificarShouldIgnoreRequisicoesEntirelyInThePast() {
        LocalDate ontem = LocalDate.now().minusDays(1);
        RequisicaoEquipamento requisicao = existente(10L, ontem, ontem);

        service.notificarConflitos(tarefa, List.of(requisicao));

        verify(requisicaoRepository, never()).findConflitos(any(), any(), any(), any());
        verifyNoInteractions(notificationService);
    }
}
