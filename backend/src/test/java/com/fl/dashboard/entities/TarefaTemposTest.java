package com.fl.dashboard.entities;

import com.fl.dashboard.enums.TarefaStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TarefaTemposTest {

    private static Tarefa carregada(TarefaStatus status) {
        Tarefa t = new Tarefa();
        t.setStatus(status);
        t.lembrarStatusCarregado();
        return t;
    }

    @Test
    void freezesTheFirstPlannedDuration() {
        Tarefa t = new Tarefa();
        t.setWorkingDays(2);
        t.registarTempos();
        assertEquals(2, t.getDiasEstimados());

        t.setWorkingDays(5);
        t.registarTempos();
        assertEquals(2, t.getDiasEstimados());
    }

    @Test
    void estimateWaitsUntilTheTarefaHasDates() {
        Tarefa t = new Tarefa();
        t.registarTempos();
        assertNull(t.getDiasEstimados());

        t.setWorkingDays(3);
        t.registarTempos();
        assertEquals(3, t.getDiasEstimados());
    }

    @Test
    void stampsCompletionOnTheMoveToDone() {
        Tarefa t = carregada(TarefaStatus.IN_REVIEW);
        t.setStatus(TarefaStatus.DONE);
        t.registarTempos();
        assertNotNull(t.getDataConclusao());
    }

    @Test
    void keepsTheCompletionDateOnLaterEditsWhileDone() {
        Tarefa t = carregada(TarefaStatus.DONE);
        LocalDateTime original = LocalDateTime.of(2026, 1, 5, 10, 0);
        t.setDataConclusao(original);
        t.registarTempos();
        assertEquals(original, t.getDataConclusao());
    }

    @Test
    void doesNotInventACompletionDateForTarefasDoneBeforeTheColumnExisted() {
        Tarefa t = carregada(TarefaStatus.DONE);
        t.setDescricao("edited");
        t.registarTempos();
        assertNull(t.getDataConclusao());
    }

    @Test
    void clearsTheCompletionDateWhenReopened() {
        Tarefa t = carregada(TarefaStatus.DONE);
        t.setDataConclusao(LocalDateTime.now());
        t.setStatus(TarefaStatus.IN_PROGRESS);
        t.registarTempos();
        assertNull(t.getDataConclusao());

        t.setStatus(TarefaStatus.DONE);
        t.registarTempos();
        assertNotNull(t.getDataConclusao());
    }

    @Test
    void tarefaCreatedAlreadyDoneGetsACompletionDate() {
        Tarefa t = new Tarefa();
        t.setStatus(TarefaStatus.DONE);
        t.registarTempos();
        assertNotNull(t.getDataConclusao());
    }

    @Test
    void startsTheReviewClockOnEnteringReview() {
        Tarefa t = carregada(TarefaStatus.IN_PROGRESS);
        t.setStatus(TarefaStatus.IN_REVIEW);
        t.registarTempos();
        assertNotNull(t.getEntradaRevisao());
        assertEquals(0, t.getDevolucoes());
    }

    @Test
    void addsReviewTimeOnApprovalWithoutCountingAReturn() {
        Tarefa t = carregada(TarefaStatus.IN_REVIEW);
        t.setEntradaRevisao(LocalDateTime.now().minusDays(7));
        t.setStatus(TarefaStatus.DONE);
        t.registarTempos();
        assertNull(t.getEntradaRevisao());
        assertEquals(5, t.getDiasEmRevisao());
        assertEquals(0, t.getDevolucoes());
        assertNotNull(t.getDataConclusao());
    }

    @Test
    void sendingBackCountsAReturnAndAccumulatesAcrossRounds() {
        Tarefa t = carregada(TarefaStatus.IN_REVIEW);
        t.setEntradaRevisao(LocalDateTime.now().minusDays(7));
        t.setStatus(TarefaStatus.IN_PROGRESS);
        t.registarTempos();
        assertEquals(5, t.getDiasEmRevisao());
        assertEquals(1, t.getDevolucoes());
        assertNull(t.getDataConclusao());

        // Second round, reviewed and approved the same day: +0 days, no new return.
        t.setStatus(TarefaStatus.IN_REVIEW);
        t.registarTempos();
        t.setStatus(TarefaStatus.DONE);
        t.registarTempos();
        assertEquals(5, t.getDiasEmRevisao());
        assertEquals(1, t.getDevolucoes());
    }

    @Test
    void editingATarefaWhileInReviewKeepsTheClockRunning() {
        Tarefa t = carregada(TarefaStatus.IN_REVIEW);
        LocalDateTime entrada = LocalDateTime.now().minusDays(2);
        t.setEntradaRevisao(entrada);
        t.setDescricao("edited");
        t.registarTempos();
        assertEquals(entrada, t.getEntradaRevisao());
        assertEquals(0, t.getDiasEmRevisao());
    }
}
