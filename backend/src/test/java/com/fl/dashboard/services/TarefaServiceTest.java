package com.fl.dashboard.services;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.ProjetoFase;
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
import com.fl.dashboard.services.exceptions.ConclusaoNaoPermitidaException;
import com.fl.dashboard.services.exceptions.SubtarefaDivisaoInvalidaException;
import com.fl.dashboard.services.exceptions.TarefaArquivamentoInvalidoException;
import org.junit.jupiter.api.AfterEach;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

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

    @Mock
    private ChatNotificationPublisher chatNotificationPublisher;

    @Mock
    private RequisicaoEquipamentoService requisicaoEquipamentoService;

    @Mock
    private ProjetoFaseService projetoFaseService;

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

    // --- fase (projeto timeline phase) ---

    private Projeto projeto(Long id) {
        Projeto projeto = new Projeto();
        projeto.setId(id);
        return projeto;
    }

    private ProjetoFase faseDe(Projeto projeto) {
        ProjetoFase fase = new ProjetoFase();
        fase.setId(50L);
        fase.setProjeto(projeto);
        fase.setNome("Design Freeze");
        return fase;
    }

    private TarefaUpdateDTO updateDto(Long projetoId) {
        TarefaUpdateDTO dto = new TarefaUpdateDTO();
        dto.setId(1L);
        dto.setDescricao("Updated Task");
        dto.setProjetoId(projetoId);
        return dto;
    }

    @Test
    void updateWithAssociationsShouldKeepFaseWhenFaseIdNotSent() {
        Projeto projeto = projeto(5L);
        ProjetoFase fase = faseDe(projeto);
        tarefa.setProjeto(projeto);
        tarefa.setFase(fase);
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(projeto));
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.updateWithAssociations(updateDto(5L));

        assertSame(fase, tarefa.getFase());
        verify(projetoFaseService, never()).resolverFaseParaTarefa(any(), any());
    }

    @Test
    void updateWithAssociationsShouldClearFaseWhenFaseIdSentAsNull() {
        Projeto projeto = projeto(5L);
        tarefa.setProjeto(projeto);
        tarefa.setFase(faseDe(projeto));
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(projeto));
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        TarefaUpdateDTO dto = updateDto(5L);
        dto.setFaseId(null);
        tarefaService.updateWithAssociations(dto);

        assertNull(tarefa.getFase());
        verify(projetoFaseService).resolverFaseParaTarefa(tarefa, null);
    }

    @Test
    void updateWithAssociationsShouldDropFaseWhenProjetoChangesAndFaseIdNotSent() {
        Projeto antigo = projeto(5L);
        Projeto novo = projeto(6L);
        tarefa.setProjeto(antigo);
        tarefa.setFase(faseDe(antigo));
        when(projetoRepository.findById(6L)).thenReturn(Optional.of(novo));
        when(tarefaRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        tarefaService.updateWithAssociations(updateDto(6L));

        assertNull(tarefa.getFase());
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


    // --- Only MOVE_CARD_TO_DONE may mark a tarefa as DONE (was enforced by the Kanban UI only) ---

    private static void autenticarCom(String... authorities) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "user@test", null, java.util.Arrays.stream(authorities).map(SimpleGrantedAuthority::new).toList()));
    }

    @AfterEach
    void limparSeguranca() {
        SecurityContextHolder.clearContext();
    }

    private Tarefa tarefaEmRevisao() {
        Tarefa t = new Tarefa();
        t.setId(50L);
        t.setDescricao("Rever desenhos");
        t.setStatus(TarefaStatus.IN_REVIEW);
        when(tarefaRepository.findByIdActive(50L)).thenReturn(Optional.of(t));
        when(tarefaRepository.save(any(Tarefa.class))).thenAnswer(inv -> inv.getArgument(0));
        return t;
    }

    @Test
    @DisplayName("updateStatus: an employee cannot move a tarefa to DONE")
    void updateStatus_employeeCannotComplete() {
        autenticarCom("MOVE_CARD_TO_REVIEW", "MOVE_CARD_TO_IN_PROGRESS");
        Tarefa t = tarefaEmRevisao();

        assertThrows(ConclusaoNaoPermitidaException.class,
                () -> tarefaService.updateStatus(50L, TarefaStatus.DONE));
        assertEquals(TarefaStatus.IN_REVIEW, t.getStatus());
        verify(tarefaRepository, never()).save(any(Tarefa.class));
    }

    @Test
    @DisplayName("updateStatus: an employee can still send work back or hand it over for review")
    void updateStatus_employeeCanMoveOutsideDone() {
        autenticarCom("MOVE_CARD_TO_REVIEW", "MOVE_CARD_TO_IN_PROGRESS");
        Tarefa t = tarefaEmRevisao();

        assertDoesNotThrow(() -> tarefaService.updateStatus(50L, TarefaStatus.IN_PROGRESS));
        assertEquals(TarefaStatus.IN_PROGRESS, t.getStatus());
    }

    @Test
    @DisplayName("updateStatus: a manager can approve a tarefa (DONE)")
    void updateStatus_managerCanComplete() {
        autenticarCom("MOVE_CARD_TO_DONE");
        Tarefa t = tarefaEmRevisao();

        assertDoesNotThrow(() -> tarefaService.updateStatus(50L, TarefaStatus.DONE));
        assertEquals(TarefaStatus.DONE, t.getStatus());
    }

    @Test
    @DisplayName("updateStatus: without an authenticated user, DONE is refused")
    void updateStatus_noAuthenticationCannotComplete() {
        SecurityContextHolder.clearContext();
        tarefaEmRevisao();

        assertThrows(ConclusaoNaoPermitidaException.class,
                () -> tarefaService.updateStatus(50L, TarefaStatus.DONE));
    }

    @Test
    @DisplayName("insertWithAssociations: an employee cannot create a tarefa already DONE")
    void insert_employeeCannotCreateDone() {
        autenticarCom("CREATE_TASK");
        TarefaInsertDTO dto = new TarefaInsertDTO();
        dto.setDescricao("Nova tarefa feita");
        dto.setPrioridade("MEDIA");
        dto.setStatus(TarefaStatus.DONE);

        assertThrows(ConclusaoNaoPermitidaException.class, () -> tarefaService.insertWithAssociations(dto));
        verify(tarefaRepository, never()).save(any(Tarefa.class));
    }
}
