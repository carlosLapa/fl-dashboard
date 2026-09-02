package com.fl.dashboard.services;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.TarefaLink;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.dto.TarefaInsertDTO;
import com.fl.dashboard.dto.TarefaLinkDTO;
import com.fl.dashboard.dto.TarefaUpdateDTO;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.SubtarefaDivisaoInvalidaException;
import com.fl.dashboard.services.exceptions.TarefaArquivamentoInvalidoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
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

    // --- insertWithAssociations ---

    @Test
    void insertWithAssociationsShouldPersistStatusProvidedInDto() {
        TarefaInsertDTO dto = new TarefaInsertDTO();
        dto.setDescricao("New Task");
        dto.setStatus(TarefaStatus.IN_PROGRESS);
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.insertWithAssociations(dto);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        assertEquals(TarefaStatus.IN_PROGRESS, captor.getValue().getStatus());
    }

    @Test
    void insertWithAssociationsShouldDefaultToBacklogWhenStatusNotProvided() {
        TarefaInsertDTO dto = new TarefaInsertDTO();
        dto.setDescricao("New Task");
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.insertWithAssociations(dto);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        assertEquals(TarefaStatus.BACKLOG, captor.getValue().getStatus());
    }

    // --- links partilhados ---

    @Test
    void insertWithAssociationsShouldPersistProvidedLinks() {
        TarefaInsertDTO dto = new TarefaInsertDTO();
        dto.setDescricao("New Task");
        TarefaLinkDTO linkDTO = new TarefaLinkDTO();
        linkDTO.setUrl("https://onedrive.com/plantas");
        linkDTO.setDescricao("Plantas do projeto");
        dto.setLinks(List.of(linkDTO));
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.insertWithAssociations(dto);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        List<TarefaLink> links = captor.getValue().getLinks();
        assertEquals(1, links.size());
        assertEquals("https://onedrive.com/plantas", links.get(0).getUrl());
        assertEquals("Plantas do projeto", links.get(0).getDescricao());
        assertSame(captor.getValue(), links.get(0).getTarefa());
    }

    @Test
    void updateWithAssociationsShouldSyncLinksKeepUpdateAndRemove() {
        TarefaLink existingKeep = new TarefaLink();
        existingKeep.setId(10L);
        existingKeep.setUrl("https://old-url");
        existingKeep.setDescricao("old desc");
        existingKeep.setTarefa(tarefa);

        TarefaLink existingRemove = new TarefaLink();
        existingRemove.setId(20L);
        existingRemove.setUrl("https://to-be-removed");
        existingRemove.setTarefa(tarefa);

        tarefa.getLinks().add(existingKeep);
        tarefa.getLinks().add(existingRemove);

        TarefaUpdateDTO dto = new TarefaUpdateDTO();
        dto.setId(1L);
        dto.setDescricao("Updated Task");

        TarefaLinkDTO keepDto = new TarefaLinkDTO();
        keepDto.setId(10L);
        keepDto.setUrl("https://updated-url");
        keepDto.setDescricao("updated desc");

        TarefaLinkDTO newDto = new TarefaLinkDTO();
        newDto.setUrl("https://brand-new");
        newDto.setDescricao("new link");

        dto.setLinks(List.of(keepDto, newDto));

        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.updateWithAssociations(dto);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        List<TarefaLink> links = captor.getValue().getLinks();

        assertEquals(2, links.size());
        assertTrue(links.stream().anyMatch(l ->
                Objects.equals(l.getId(), 10L) && l.getUrl().equals("https://updated-url")
                        && l.getDescricao().equals("updated desc")));
        assertTrue(links.stream().anyMatch(l -> l.getId() == null && l.getUrl().equals("https://brand-new")));
        assertTrue(links.stream().noneMatch(l -> Objects.equals(l.getId(), 20L)));
    }

    // --- arquivar / reativar ---

    @Test
    void arquivarShouldThrowWhenStatusIsNotDone() {
        tarefa.setStatus(TarefaStatus.IN_PROGRESS);

        assertThrows(TarefaArquivamentoInvalidoException.class,
                () -> tarefaService.arquivar(1L));

        verify(tarefaRepository, never()).save(any());
    }

    @Test
    void arquivarShouldSetArquivadaEmWhenStatusIsDone() {
        tarefa.setStatus(TarefaStatus.DONE);
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.arquivar(1L);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        assertNotNull(captor.getValue().getArquivadaEm());
    }

    @Test
    void arquivarShouldThrowWhenAlreadyArquivada() {
        tarefa.setStatus(TarefaStatus.DONE);
        tarefa.markAsArquivada();

        assertThrows(TarefaArquivamentoInvalidoException.class,
                () -> tarefaService.arquivar(1L));

        verify(tarefaRepository, never()).save(any());
    }

    @Test
    void reativarShouldClearArquivadaEm() {
        tarefa.setStatus(TarefaStatus.DONE);
        tarefa.markAsArquivada();
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.reativar(1L);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        assertNull(captor.getValue().getArquivadaEm());
    }

}
