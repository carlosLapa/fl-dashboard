package com.fl.dashboard.services;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.DeadlineValidationException;
import com.fl.dashboard.utils.ProjetoDTOMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Projeto Service Tests")
@MockitoSettings(strictness = Strictness.LENIENT)
class ProjetoServiceTest {

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExternoRepository externoRepository;

    @Mock
    private ProjetoDTOMapper projetoDTOMapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ProjetoUserHistoryService projetoUserHistoryService;

    @InjectMocks
    private ProjetoService projetoService;

    private Projeto projeto;
    private User coordenador;
    private User teamMember;
    private Date prazoAtual;
    private Date novoPrazo;

    @BeforeEach
    void setUp() {
        Calendar cal = Calendar.getInstance();
        cal.set(2026, Calendar.SEPTEMBER, 1, 0, 0, 0);
        prazoAtual = cal.getTime();
        cal.set(2026, Calendar.SEPTEMBER, 15, 0, 0, 0);
        novoPrazo = cal.getTime();

        coordenador = new User();
        coordenador.setId(1L);

        teamMember = new User();
        teamMember.setId(2L);

        projeto = new Projeto();
        projeto.setId(10L);
        projeto.setPrazo(prazoAtual);
        projeto.setCoordenador(coordenador);
        Set<User> users = new HashSet<>();
        users.add(coordenador);
        users.add(teamMember);
        projeto.getUsers().addAll(users);

        when(projetoRepository.findById(10L)).thenReturn(Optional.of(projeto));
        when(projetoRepository.save(any(Projeto.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("extendPrazo notifies every project team member, not just the coordinator")
    void extendPrazo_notifiesWholeTeam() {
        projetoService.extendPrazo(10L, novoPrazo, null);

        ArgumentCaptor<User> recipientCaptor = ArgumentCaptor.forClass(User.class);
        verify(notificationService, times(2)).createProjectDeadlineExtendedNotification(
                recipientCaptor.capture(), eq(projeto), eq(prazoAtual), eq(novoPrazo), any());

        Set<Long> notifiedIds = new HashSet<>();
        for (User recipient : recipientCaptor.getAllValues()) {
            notifiedIds.add(recipient.getId());
        }
        assertEquals(Set.of(1L, 2L), notifiedIds);
    }

    @Test
    @DisplayName("extendPrazo does not double-notify a coordinator who is also a team member")
    void extendPrazo_doesNotDuplicateCoordinatorInTeam() {
        // coordenador is already part of projeto.getUsers() from setUp()
        projetoService.extendPrazo(10L, novoPrazo, null);

        verify(notificationService, times(1)).createProjectDeadlineExtendedNotification(
                eq(coordenador), eq(projeto), any(), any(), any());
    }

    @Test
    @DisplayName("extendPrazo rejects a new deadline that isn't after the current one")
    void extendPrazo_rejectsNonFutureDeadline() {
        assertThrows(DeadlineValidationException.class,
                () -> projetoService.extendPrazo(10L, prazoAtual, null));

        verify(notificationService, never()).createProjectDeadlineExtendedNotification(
                any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("extendPrazo updates and persists the project's deadline")
    void extendPrazo_updatesDeadline() {
        projetoService.extendPrazo(10L, novoPrazo, null);

        assertEquals(novoPrazo, projeto.getPrazo());
        verify(projetoRepository).save(projeto);
    }
}
