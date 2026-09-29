package com.fl.dashboard.services;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.ChatEventType;
import com.fl.dashboard.enums.ProjetoStatus;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.events.ChatNotificationEvent;
import com.fl.dashboard.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Chat Notification Publisher Tests")
@ExtendWith(MockitoExtension.class)
class ChatNotificationPublisherTest {

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private UserRepository userRepository;

    private ChatNotificationPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new ChatNotificationPublisher(eventPublisher, userRepository);
    }

    private User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        return user;
    }

    private Projeto projeto() {
        Projeto projeto = new Projeto();
        projeto.setId(7L);
        projeto.setDesignacao("Moradia Cascais");
        projeto.setStatus(ProjetoStatus.ATIVO);
        return projeto;
    }

    private Tarefa tarefa(Projeto projeto) {
        Tarefa tarefa = new Tarefa();
        tarefa.setId(3L);
        tarefa.setDescricao("Rever caderno de encargos");
        tarefa.setStatus(TarefaStatus.TODO);
        tarefa.setProjeto(projeto);
        tarefa.setUsers(new HashSet<>(Set.of(user(1L, "Ana"))));
        return tarefa;
    }

    private ChatNotificationEvent captureEvent() {
        ArgumentCaptor<ChatNotificationEvent> captor = ArgumentCaptor.forClass(ChatNotificationEvent.class);
        verify(eventPublisher).publishEvent(captor.capture());
        return captor.getValue();
    }

    @Test
    void tarefaCriadaShouldSnapshotFieldsAndLinkToProjetoKanban() {
        publisher.tarefaCriada(tarefa(projeto()));

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.TAREFA_CRIADA, event.type());
        assertEquals("Rever caderno de encargos", event.nome());
        assertEquals("/projetos/7/full", event.linkPath());
        assertEquals("Moradia Cascais", event.campos().get("Projeto"));
        assertEquals("A Fazer", event.campos().get("Estado"));
        assertEquals("Ana", event.campos().get("Colaboradores"));
        // No authenticated request in a unit test -> treated like a system-triggered change.
        assertNull(event.autor());
    }

    @Test
    void tarefaEstadoAlteradoToDoneShouldBeTarefaConcluida() {
        Tarefa tarefa = tarefa(projeto());
        tarefa.setStatus(TarefaStatus.DONE);

        publisher.tarefaEstadoAlterado(tarefa, TarefaStatus.IN_REVIEW);

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.TAREFA_CONCLUIDA, event.type());
        assertEquals("Em Revisão → Concluído", event.campos().get("Estado"));
    }

    @Test
    void tarefaEstadoAlteradoShouldSkipWhenStatusDidNotChange() {
        publisher.tarefaEstadoAlterado(tarefa(projeto()), TarefaStatus.TODO);

        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void tarefaAtualizadaShouldReportCollaboratorChanges() {
        Tarefa tarefa = tarefa(projeto());
        Set<User> previous = Set.of(user(2L, "Bruno"));

        publisher.tarefaAtualizada(tarefa, tarefa.getPrazoReal(), previous);

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.TAREFA_COLABORADORES_ALTERADOS, event.type());
        assertEquals("Ana", event.campos().get("Adicionados"));
        assertEquals("Bruno", event.campos().get("Removidos"));
    }

    @Test
    void tarefaAtualizadaWithSameUsersShouldBeTarefaEditada() {
        Tarefa tarefa = tarefa(projeto());

        publisher.tarefaAtualizada(tarefa, tarefa.getPrazoReal(), new HashSet<>(tarefa.getUsers()));

        assertEquals(ChatEventType.TAREFA_EDITADA, captureEvent().type());
    }

    @Test
    void tarefaAtualizadaWithLaterPrazoShouldTakePrecedenceOverCollaborators() {
        Tarefa tarefa = tarefa(projeto());
        Date anterior = new Date(1_790_000_000_000L);
        tarefa.setPrazoReal(new Date(anterior.getTime() + 7L * 24 * 3600 * 1000));

        publisher.tarefaAtualizada(tarefa, anterior, Set.of());

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.TAREFA_PRAZO_PRORROGADO, event.type());
        assertTrue(event.campos().get("Prazo").contains(" → "));
        // The collaborator change is still reported, just not as the message type.
        assertEquals("Ana", event.campos().get("Adicionados"));
    }

    @Test
    void tarefaAtualizadaWithEarlierPrazoShouldBePrazoAlterado() {
        Tarefa tarefa = tarefa(projeto());
        Date anterior = new Date(1_790_000_000_000L);
        tarefa.setPrazoReal(new Date(anterior.getTime() - 7L * 24 * 3600 * 1000));

        publisher.tarefaAtualizada(tarefa, anterior, new HashSet<>(tarefa.getUsers()));

        assertEquals(ChatEventType.TAREFA_PRAZO_ALTERADO, captureEvent().type());
    }

    @Test
    void tarefaRemovidaShouldHaveNoLink() {
        publisher.tarefaRemovida(tarefa(projeto()));

        assertNull(captureEvent().linkPath());
    }

    @Test
    void projetoAtualizadoShouldPrioritizeStatusOverCollaborators() {
        Projeto projeto = projeto();
        projeto.setStatus(ProjetoStatus.CONCLUIDO);
        projeto.getUsers().add(user(1L, "Ana"));

        publisher.projetoAtualizado(projeto, ProjetoStatus.EM_PROGRESSO, null, Set.of());

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.PROJETO_CONCLUIDO, event.type());
        assertEquals("Em Progresso → Concluído", event.campos().get("Estado"));
        assertEquals("Ana", event.campos().get("Adicionados"));
        assertEquals("/projetos/7/details", event.linkPath());
    }

    @Test
    void projetoAtualizadoWithoutRelevantChangesShouldBeProjetoEditado() {
        Projeto projeto = projeto();

        publisher.projetoAtualizado(projeto, ProjetoStatus.ATIVO, null, Set.of());

        assertEquals(ChatEventType.PROJETO_EDITADO, captureEvent().type());
    }

    @Test
    void projetoAtualizadoWithLaterPrazoShouldBePrazoProrrogado() {
        Projeto projeto = projeto();
        Date anterior = new Date(1_790_000_000_000L);
        projeto.setPrazo(new Date(anterior.getTime() + 30L * 24 * 3600 * 1000));

        publisher.projetoAtualizado(projeto, ProjetoStatus.ATIVO, anterior, Set.of());

        ChatNotificationEvent event = captureEvent();
        assertEquals(ChatEventType.PROJETO_PRAZO_PRORROGADO, event.type());
        assertTrue(event.campos().get("Prazo").contains(" → "));
    }

    @Test
    void projetoAtualizadoWithEarlierPrazoShouldBePrazoAlterado() {
        Projeto projeto = projeto();
        Date anterior = new Date(1_790_000_000_000L);
        projeto.setPrazo(new Date(anterior.getTime() - 30L * 24 * 3600 * 1000));

        publisher.projetoAtualizado(projeto, ProjetoStatus.ATIVO, anterior, Set.of());

        assertEquals(ChatEventType.PROJETO_PRAZO_ALTERADO, captureEvent().type());
    }

    @Test
    void projetoAtualizadoWithSameDayPrazoShouldNotCountAsPrazoChange() {
        Projeto projeto = projeto();
        Date anterior = new Date(1_790_000_000_000L);
        // Same calendar day, different time-of-day (e.g. a Timestamp from the DB vs a Date from the DTO).
        projeto.setPrazo(new Date(anterior.getTime() + 60_000L));

        publisher.projetoAtualizado(projeto, ProjetoStatus.ATIVO, anterior, Set.of());

        assertEquals(ChatEventType.PROJETO_EDITADO, captureEvent().type());
    }

    @Test
    void projetoPrioridadeShouldUseDisplayLabel() {
        Projeto projeto = projeto();
        projeto.setPrioridade("MEDIA");

        publisher.projetoCriado(projeto);

        assertEquals("Média", captureEvent().campos().get("Prioridade"));
    }

    @Test
    void publishFailureShouldNeverPropagate() {
        doThrow(new RuntimeException("boom")).when(eventPublisher).publishEvent(any());

        assertDoesNotThrow(() -> publisher.projetoCriado(projeto()));
    }
}
