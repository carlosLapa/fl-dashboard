package com.fl.dashboard.services;

import com.fl.dashboard.dto.SubtarefaDTO;
import com.fl.dashboard.dto.SubtarefaDivisaoItemDTO;
import com.fl.dashboard.entities.Subtarefa;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.SubtarefaRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.fl.dashboard.services.exceptions.SubtarefaDivisaoInvalidaException;
import com.fl.dashboard.services.exceptions.SubtarefasIncompletasException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Subtarefa Service Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SubtarefaServiceTest {

    @Mock
    private SubtarefaRepository subtarefaRepository;

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SubtarefaService subtarefaService;

    private Tarefa tarefa;

    @BeforeEach
    void setUp() {
        tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");

        when(tarefaRepository.findByIdActive(1L)).thenReturn(Optional.of(tarefa));
        when(subtarefaRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setName("User " + id);
        return user;
    }

    private Set<User> usersWithIds(int n) {
        Set<User> users = new HashSet<>();
        for (long i = 1; i <= n; i++) {
            users.add(user(i));
        }
        return users;
    }

    // --- dividirEmSubtarefas ---

    @Test
    void dividirEmSubtarefasShouldThrowResourceNotFoundExceptionWhenTarefaDoesNotExist() {
        when(tarefaRepository.findByIdActive(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> subtarefaService.dividirEmSubtarefas(99L, null));
    }

    @Test
    void dividirEmSubtarefasShouldThrowWhenTarefaAlreadySplit() {
        tarefa.setUsers(usersWithIds(2));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(true);

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> subtarefaService.dividirEmSubtarefas(1L, null));

        verify(subtarefaRepository, never()).saveAll(any());
    }

    @Test
    void dividirEmSubtarefasShouldThrowWhenNoUsersAssigned() {
        tarefa.setUsers(new HashSet<>());

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> subtarefaService.dividirEmSubtarefas(1L, null));
    }

    @Test
    void dividirEmSubtarefasShouldThrowWhenOnlyOneUserAssigned() {
        tarefa.setUsers(usersWithIds(1));

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> subtarefaService.dividirEmSubtarefas(1L, null));
    }

    @Test
    void dividirEmSubtarefasShouldTranslateConcurrentRaceIntoBusinessException() {
        tarefa.setUsers(usersWithIds(2));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);
        when(subtarefaRepository.saveAll(any())).thenThrow(new DataIntegrityViolationException("duplicate"));

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> subtarefaService.dividirEmSubtarefas(1L, null));
    }

    @ParameterizedTest(name = "n={0} colaboradores soma exatamente 100.00")
    @ValueSource(ints = {2, 3, 7})
    void dividirEmSubtarefasShouldSplitPercentageSummingToExactly100(int n) {
        tarefa.setUsers(usersWithIds(n));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        List<SubtarefaDTO> result = subtarefaService.dividirEmSubtarefas(1L, null);

        assertEquals(n, result.size());
        BigDecimal sum = result.stream()
                .map(SubtarefaDTO::getPercentual)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, new BigDecimal("100.00").compareTo(sum),
                "A soma das percentagens deve ser exatamente 100.00 para n=" + n);
    }

    @Test
    void dividirEmSubtarefasWithThreeUsersShouldGive333333And3334() {
        tarefa.setUsers(usersWithIds(3));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        List<SubtarefaDTO> result = subtarefaService.dividirEmSubtarefas(1L, null);

        List<BigDecimal> percentuais = result.stream().map(SubtarefaDTO::getPercentual).sorted().toList();
        assertEquals(new BigDecimal("33.33"), percentuais.get(0));
        assertEquals(new BigDecimal("33.33"), percentuais.get(1));
        assertEquals(new BigDecimal("33.34"), percentuais.get(2));
    }

    @Test
    void dividirEmSubtarefasShouldAttachOptionalDescricaoPerUser() {
        tarefa.setUsers(usersWithIds(2));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        SubtarefaDivisaoItemDTO item = new SubtarefaDivisaoItemDTO();
        item.setUserId(1L);
        item.setDescricao("Parte do user 1");

        List<SubtarefaDTO> result = subtarefaService.dividirEmSubtarefas(1L, List.of(item));

        SubtarefaDTO dto = result.stream().filter(s -> s.getUser().getId().equals(1L)).findFirst().orElseThrow();
        assertEquals("Parte do user 1", dto.getDescricao());
    }

    @Test
    void dividirEmSubtarefasShouldNotifyEachAssignedUser() {
        tarefa.setUsers(usersWithIds(2));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        subtarefaService.dividirEmSubtarefas(1L, null);

        verify(notificationService, times(2)).processNotification(any());
    }

    // --- updateSubtarefa ---

    @Test
    void updateSubtarefaShouldThrowResourceNotFoundExceptionWhenSubtarefaDoesNotExist() {
        when(subtarefaRepository.findByIdAndTarefaId(5L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> subtarefaService.updateSubtarefa(1L, 5L, "Nova descrição"));
    }

    @Test
    void updateSubtarefaShouldUpdateDescricaoAndPersist() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), false);
        subtarefa.setDescricao("Descrição antiga");
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubtarefaDTO result = subtarefaService.updateSubtarefa(1L, 10L, "Descrição nova");

        assertEquals("Descrição nova", result.getDescricao());
        verify(subtarefaRepository).save(subtarefa);
    }

    @Test
    void updateSubtarefaShouldAllowClearingDescricao() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), false);
        subtarefa.setDescricao("Descrição antiga");
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubtarefaDTO result = subtarefaService.updateSubtarefa(1L, 10L, null);

        assertNull(result.getDescricao());
    }

    // --- concluirSubtarefa ---

    @Test
    void concluirSubtarefaShouldThrowResourceNotFoundExceptionWhenSubtarefaDoesNotExist() {
        when(subtarefaRepository.findByIdAndTarefaId(5L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> subtarefaService.concluirSubtarefa(1L, 5L));
    }

    @Test
    void concluirSubtarefaShouldMarkAsCompleteAndNotify() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), false);
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubtarefaDTO result = subtarefaService.concluirSubtarefa(1L, 10L);

        assertTrue(result.isConcluida());
        assertNotNull(result.getConcluidaEm());
        verify(subtarefaRepository).save(any(Subtarefa.class));
        verify(notificationService).processNotification(any());
    }

    @Test
    void concluirSubtarefaShouldBeIdempotentWhenAlreadyCompleted() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), true);
        subtarefa.setConcluidaEm(LocalDateTime.of(2026, 1, 1, 0, 0));
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));

        SubtarefaDTO result = subtarefaService.concluirSubtarefa(1L, 10L);

        assertTrue(result.isConcluida());
        assertEquals(LocalDateTime.of(2026, 1, 1, 0, 0), result.getConcluidaEm());
        verify(subtarefaRepository, never()).save(any());
        verify(notificationService, never()).processNotification(any());
    }

    // --- desfazerDivisao ---

    @Test
    void desfazerDivisaoShouldThrowResourceNotFoundExceptionWhenTarefaWasNeverSplit() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> subtarefaService.desfazerDivisao(1L));

        verify(subtarefaRepository, never()).deleteByTarefaId(anyLong());
    }

    @Test
    void desfazerDivisaoShouldThrowWhenAnySubtarefaAlreadyCompleted() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(true);
        when(subtarefaRepository.existsByTarefaIdAndConcluidaTrue(1L)).thenReturn(true);

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> subtarefaService.desfazerDivisao(1L));

        verify(subtarefaRepository, never()).deleteByTarefaId(anyLong());
    }

    @Test
    void desfazerDivisaoShouldDeleteAllSubtarefasWhenNoneCompleted() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(true);
        when(subtarefaRepository.existsByTarefaIdAndConcluidaTrue(1L)).thenReturn(false);

        subtarefaService.desfazerDivisao(1L);

        verify(subtarefaRepository).deleteByTarefaId(1L);
    }

    // --- reabrirSubtarefa ---

    @Test
    void reabrirSubtarefaShouldThrowResourceNotFoundExceptionWhenSubtarefaDoesNotExist() {
        when(subtarefaRepository.findByIdAndTarefaId(5L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> subtarefaService.reabrirSubtarefa(1L, 5L));
    }

    @Test
    void reabrirSubtarefaShouldClearConcluidaAndConcluidaEm() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), true);
        subtarefa.setConcluidaEm(LocalDateTime.of(2026, 1, 1, 0, 0));
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubtarefaDTO result = subtarefaService.reabrirSubtarefa(1L, 10L);

        assertFalse(result.isConcluida());
        assertNull(result.getConcluidaEm());
        verify(subtarefaRepository).save(subtarefa);
    }

    @Test
    void reabrirSubtarefaShouldBeIdempotentWhenNotCompleted() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("50.00"), false);
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));

        SubtarefaDTO result = subtarefaService.reabrirSubtarefa(1L, 10L);

        assertFalse(result.isConcluida());
        verify(subtarefaRepository, never()).save(any());
    }

    // --- isOwnerOfSubtarefa ---

    @Test
    void isOwnerOfSubtarefaShouldReturnFalseWhenUserDoesNotExist() {
        when(userRepository.findByEmail("ghost@test.local")).thenReturn(null);

        assertFalse(subtarefaService.isOwnerOfSubtarefa(1L, 10L, "ghost@test.local"));
        verify(subtarefaRepository, never()).findByIdAndTarefaId(anyLong(), anyLong());
    }

    @Test
    void isOwnerOfSubtarefaShouldReturnFalseWhenSubtarefaDoesNotExist() {
        User requester = user(1L);
        requester.setEmail("owner@test.local");
        when(userRepository.findByEmail("owner@test.local")).thenReturn(requester);
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.empty());

        assertFalse(subtarefaService.isOwnerOfSubtarefa(1L, 10L, "owner@test.local"));
    }

    @Test
    void isOwnerOfSubtarefaShouldReturnTrueWhenRequesterIsTheAssignedUser() {
        User owner = user(1L);
        owner.setEmail("owner@test.local");
        Subtarefa subtarefa = buildSubtarefa(10L, owner, new BigDecimal("50.00"), false);
        when(userRepository.findByEmail("owner@test.local")).thenReturn(owner);
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));

        assertTrue(subtarefaService.isOwnerOfSubtarefa(1L, 10L, "owner@test.local"));
    }

    @Test
    void isOwnerOfSubtarefaShouldReturnFalseWhenRequesterIsAnotherCollaborator() {
        User owner = user(1L);
        User someoneElse = user(2L);
        someoneElse.setEmail("other@test.local");
        Subtarefa subtarefa = buildSubtarefa(10L, owner, new BigDecimal("50.00"), false);
        when(userRepository.findByEmail("other@test.local")).thenReturn(someoneElse);
        when(subtarefaRepository.findByIdAndTarefaId(10L, 1L)).thenReturn(Optional.of(subtarefa));

        assertFalse(subtarefaService.isOwnerOfSubtarefa(1L, 10L, "other@test.local"));
    }

    // --- assertCanTransitionStatus (gate used by TarefaService.updateStatus) ---

    @Test
    void assertCanTransitionStatusShouldAllowWhenTarefaWasNeverSplit() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> subtarefaService.assertCanTransitionStatus(1L));
        verify(subtarefaRepository, never()).sumPercentualConcluidoByTarefaId(anyLong());
    }

    @Test
    void assertCanTransitionStatusShouldBlockWhenBelow100Percent() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(true);
        when(subtarefaRepository.sumPercentualConcluidoByTarefaId(1L)).thenReturn(new BigDecimal("66.66"));

        SubtarefasIncompletasException ex = assertThrows(SubtarefasIncompletasException.class,
                () -> subtarefaService.assertCanTransitionStatus(1L));
        assertTrue(ex.getMessage().contains("66.66"));
    }

    @Test
    void assertCanTransitionStatusShouldAllowWhenExactly100Percent() {
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(true);
        when(subtarefaRepository.sumPercentualConcluidoByTarefaId(1L)).thenReturn(new BigDecimal("100.00"));

        assertDoesNotThrow(() -> subtarefaService.assertCanTransitionStatus(1L));
    }

    // --- findByTarefaId ---

    @Test
    void findByTarefaIdShouldMapEntitiesToDTOs() {
        Subtarefa subtarefa = buildSubtarefa(10L, user(1L), new BigDecimal("100.00"), false);
        when(subtarefaRepository.findByTarefaIdOrderByIdAsc(1L)).thenReturn(List.of(subtarefa));

        List<SubtarefaDTO> result = subtarefaService.findByTarefaId(1L);

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
    }

    @Test
    void dividirEmSubtarefasShouldPersistTarefaReferenceOnEachSubtarefa() {
        tarefa.setUsers(usersWithIds(2));
        when(subtarefaRepository.existsByTarefaId(1L)).thenReturn(false);

        ArgumentCaptor<List<Subtarefa>> captor = ArgumentCaptor.forClass(List.class);
        subtarefaService.dividirEmSubtarefas(1L, null);

        verify(subtarefaRepository).saveAll(captor.capture());
        assertTrue(captor.getValue().stream().allMatch(s -> s.getTarefa().equals(tarefa)));
    }

    private Subtarefa buildSubtarefa(Long id, User user, BigDecimal percentual, boolean concluida) {
        Subtarefa subtarefa = new Subtarefa();
        subtarefa.setId(id);
        subtarefa.setTarefa(tarefa);
        subtarefa.setUser(user);
        subtarefa.setPercentual(percentual);
        subtarefa.setConcluida(concluida);
        subtarefa.setCreatedAt(LocalDateTime.now());
        return subtarefa;
    }

}
