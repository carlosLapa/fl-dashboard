package com.fl.dashboard.services;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.SubtarefaDivisaoInvalidaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Tarefa Service Tests")
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class TarefaServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExternoRepository externoRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SlackNotificationManagerService slackNotificationManagerService;

    @Mock
    private SubtarefaService subtarefaService;

    @InjectMocks
    private TarefaService tarefaService;

    private Tarefa tarefa;

    @BeforeEach
    void setUp() {
        tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");
        tarefa.setUsers(new HashSet<>());

        when(tarefaRepository.findByIdActive(1L)).thenReturn(Optional.of(tarefa));
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setName("User " + id);
        return user;
    }

    // --- updateTarefaUsers ---

    @Test
    void updateTarefaUsersShouldThrowWhenTarefaAlreadyDividedIntoSubtarefas() {
        when(subtarefaService.isDividida(1L)).thenReturn(true);

        assertThrows(SubtarefaDivisaoInvalidaException.class,
                () -> tarefaService.updateTarefaUsers(1L, Set.of(2L)));

        verify(userRepository, never()).findById(any());
        verify(tarefaRepository, never()).save(any());
    }

    @Test
    void updateTarefaUsersShouldUpdateUsersWhenNotDivided() {
        when(subtarefaService.isDividida(1L)).thenReturn(false);
        User newUser = user(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(newUser));

        tarefaService.updateTarefaUsers(1L, Set.of(2L));

        assertTrue(tarefa.getUsers().contains(newUser));
    }

}
