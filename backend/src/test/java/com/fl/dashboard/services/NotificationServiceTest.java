package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.repositories.NotificationRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@Tag("unit")
@DisplayName("Notification Service Tests")
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationServiceTest {

    @Mock
    private TransactionSynchronizationManager transactionSynchronizationManager;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification;
    private NotificationResponseDTO notificationResponseDTO;
    private User user;
    private Projeto projeto;

    @BeforeEach
    void setUp() {

        user = new User();
        user.setId(1L);
        user.setName("Test User");

        projeto = new Projeto();
        projeto.setId(1L);
        projeto.setDesignacao("Test Project");
        projeto.getUsers().add(user);

        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");

        notification = new Notification();
        notification.setId(1L);
        notification.setType("TEST");
        notification.setContent("Test Content");
        notification.setIsRead(false);
        notification.setUser(user);

        notificationResponseDTO = new NotificationResponseDTO();
        notificationResponseDTO.setId(notification.getId());
        notificationResponseDTO.setType(notification.getType());
        notificationResponseDTO.setContent(notification.getContent());
        notificationResponseDTO.setIsRead(notification.getIsRead());
        notificationResponseDTO.setCreatedAt(notification.getCreatedAt());

        UserMinDTO userDto = new UserMinDTO();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        notificationResponseDTO.setUser(userDto);

        MockitoAnnotations.openMocks(this);
        TransactionSynchronizationManager.initSynchronization();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void findAllPaged() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(notificationRepository.findAll(any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findAllPaged(PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(user.getName(), result.getContent().get(0).getUser().getName());
    }

    @Test
    void findById() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        NotificationResponseDTO result = notificationService.findById(1L);

        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        assertEquals(user.getName(), result.getUser().getName());
    }

    @Test
    void insert() {
        // Setup mocks
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        doNothing().when(messagingTemplate).convertAndSend(anyString(), any(Object.class));

        NotificationInsertDTO insertDTO = new NotificationInsertDTO();
        insertDTO.setType("TEST");
        insertDTO.setContent("Test Content");
        insertDTO.setUserId(1L);

        NotificationResponseDTO result = notificationService.insert(insertDTO);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void update() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationUpdateDTO updateDTO = new NotificationUpdateDTO();
        updateDTO.setId(1L);
        updateDTO.setContent("Updated Content");

        NotificationResponseDTO result = notificationService.update(1L, updateDTO);

        assertNotNull(result);
        assertEquals("Updated Content", result.getContent());
        assertEquals(user.getName(), result.getUser().getName());
    }

    @Test
    void findByUser() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(1L, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(user.getName(), result.getContent().get(0).getUser().getName());
    }

    @Test
    void findByIdShouldThrowResourceNotFoundExceptionWhenIdDoesNotExist() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            notificationService.findById(99L);
        });
    }

    @Test
    void insertShouldThrowResourceNotFoundExceptionWhenUserDoesNotExist() {
        NotificationInsertDTO insertDTO = new NotificationInsertDTO();
        insertDTO.setUserId(99L);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            notificationService.insert(insertDTO);
        });
    }

    @Test
    void updateShouldThrowResourceNotFoundExceptionWhenNotificationDoesNotExist() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        NotificationUpdateDTO updateDTO = new NotificationUpdateDTO();

        assertThrows(ResourceNotFoundException.class, () -> {
            notificationService.update(99L, updateDTO);
        });
    }

    @Test
    void findByUserShouldThrowResourceNotFoundExceptionWhenUserDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            notificationService.findByUser(99L, PageRequest.of(0, 10));
        });
    }

    @Test
    void markAsReadShouldThrowResourceNotFoundExceptionWhenNotificationDoesNotExist() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            notificationService.markAsRead(99L);
        });
    }

    @Test
    void findByUserShouldSortByCreatedAtDescending() {
        Notification oldNotification = new Notification();
        oldNotification.setCreatedAt(new Date(System.currentTimeMillis() - 86400000)); // 1 day ago

        Notification newNotification = new Notification();
        newNotification.setCreatedAt(new Date());

        Page<Notification> page = new PageImpl<>(List.of(newNotification, oldNotification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(1L, PageRequest.of(0, 10));

        assertTrue(result.getContent().get(0).getCreatedAt()
                .after(result.getContent().get(1).getCreatedAt()));
    }

    // Delete and markAsRead tests remain the same
    @Test
    void delete() {
        doNothing().when(notificationRepository).deleteById(1L);
        assertDoesNotThrow(() -> notificationService.delete(1L));
        verify(notificationRepository, times(1)).deleteById(1L);
    }

    @Test
    void markAsRead() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.markAsRead(1L);

        assertTrue(notification.getIsRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void findUnreadByUser() {
        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserAndIsReadFalse(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findUnreadByUser(1L, PageRequest.of(0, 10));

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertFalse(result.getContent().get(0).getIsRead());
    }

    @Test
    void markMultipleAsRead() {
        List<Long> ids = List.of(1L, 2L);
        List<Notification> notifications = List.of(notification);
        when(notificationRepository.findAllById(ids)).thenReturn(notifications);
        when(notificationRepository.saveAll(any())).thenReturn(notifications);

        notificationService.markMultipleAsRead(ids);

        assertTrue(notification.getIsRead());
        verify(notificationRepository).saveAll(notifications);
    }

    @Test
    void createTaskStatusNotification() {
        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponseDTO result = notificationService.createTaskStatusNotification(user, tarefa);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createTaskAssignmentNotification() {
        when(notificationRepository.existsByTarefaIdAndUserIdAndType(1L, 1L, "TAREFA_ATRIBUIDA"))
                .thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");

        NotificationResponseDTO result = notificationService.createTaskAssignmentNotification(user, tarefa);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createTaskCompletionNotification() {
        when(notificationRepository.existsByTarefaIdAndUserIdAndType(1L, 1L, "TAREFA_CONCLUIDA"))
                .thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setDescricao("Test Task");

        NotificationResponseDTO result = notificationService.createTaskCompletionNotification(user, tarefa);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createProjectUpdateNotification() {
        when(notificationRepository.existsByProjetoIdAndUserIdAndType(1L, 1L, "PROJETO_ATUALIZADO"))
                .thenReturn(false);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Projeto projeto = new Projeto();
        projeto.setId(1L);
        projeto.setDesignacao("Test Project");

        NotificationResponseDTO result = notificationService.createProjectUpdateNotification(user, projeto);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createGeneralNotification() {
        notification.setType("NOTIFICACAO_GERAL");
        when(notificationRepository.save(any())).thenReturn(notification);

        NotificationResponseDTO result = notificationService.createGeneralNotification(user, "Test Content");

        assertEquals("NOTIFICACAO_GERAL", result.getType());
    }

    @Test
    void createTaskDeadlineNotification() {
        Notification deadlineNotification = new Notification();
        deadlineNotification.setType("TAREFA_PRAZO_PROXIMO");
        deadlineNotification.setUser(user);

        when(notificationRepository.save(any(Notification.class))).thenReturn(deadlineNotification);

        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);
        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));

        NotificationResponseDTO result = notificationService.createTaskDeadlineNotification(user, tarefa);

        assertEquals("TAREFA_PRAZO_PROXIMO", result.getType());
    }

    @Test
    void createProjectNotification() {
        ProjetoWithUsersDTO projetoDTO = new ProjetoWithUsersDTO();
        projetoDTO.setId(1L);
        projetoDTO.setDesignacao("Test Project");

        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);

        Projeto projetoEntity = new Projeto();
        projetoEntity.setId(1L);
        projetoEntity.setDesignacao("Test Project");

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projetoEntity));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createProjectNotification(projetoDTO, NotificationType.PROJETO_ATRIBUIDO, userDTO);

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSend(anyString(), any(NotificationResponseDTO.class));
    }

    @Test
    void createNotificationWithTask() {
        Tarefa tarefa = new Tarefa();
        tarefa.setId(1L);

        NotificationInsertDTO dto = new NotificationInsertDTO();
        dto.setUserId(1L);
        dto.setTarefaId(1L);
        dto.setType(NotificationType.TAREFA_ATRIBUIDA.name());

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(notificationRepository.save(any())).thenReturn(notification);

        NotificationResponseDTO result = notificationService.insert(dto);
        assertNotNull(result);
    }

    @Test
    void findByUserShouldOnlyReturnNotificationsForSpecificUser() {
        User otherUser = new User();
        otherUser.setId(2L);

        Notification otherNotification = new Notification();
        otherNotification.setUser(otherUser);

        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(user, PageRequest.of(0, 10))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(1L, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals(user.getId(), result.getContent().get(0).getUser().getId());
    }

    @Test
    @DisplayName("Should create notification with valid user and project")
    void createNotificationWithProject() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationInsertDTO dto = new NotificationInsertDTO();
        dto.setUserId(1L);
        dto.setProjetoId(1L);

        NotificationResponseDTO result = notificationService.insert(dto);

        assertNotNull(result);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createProjectNotificationShouldOnlyAllowAuthorizedUsers() {
        ProjetoWithUsersDTO projetoDTO = new ProjetoWithUsersDTO();
        projetoDTO.setId(1L);

        UserDTO authorizedUser = new UserDTO();
        authorizedUser.setId(1L);
        authorizedUser.setName("Admin User");
        authorizedUser.setEmail("admin@example.com");
        authorizedUser.setCargo("Administrator");

        Projeto projeto = new Projeto();
        projeto.setId(1L);
        projeto.getUsers().add(user);

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        notificationService.createProjectNotification(projetoDTO, NotificationType.PROJETO_ATUALIZADO, authorizedUser);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsReadShouldOnlyAllowNotificationOwner() {
        User otherUser = new User();
        otherUser.setId(2L);

        Notification otherUserNotification = new Notification();
        otherUserNotification.setId(1L);
        otherUserNotification.setUser(otherUser);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(otherUserNotification));
        doThrow(new ResourceNotFoundException("Access denied")).when(notificationRepository).save(any());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(1L));
    }

    @Test
    void managerUserShouldAccessProjectNotifications() {
        UserDTO managerUser = new UserDTO();
        managerUser.setId(1L);
        managerUser.setName("Manager User");
        managerUser.setEmail("manager@example.com");
        managerUser.setCargo("Manager");

        ProjetoWithUsersDTO projetoDTO = new ProjetoWithUsersDTO();
        projetoDTO.setId(1L);

        when(projetoRepository.findById(1L)).thenReturn(Optional.of(projeto));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        notificationService.createProjectNotification(projetoDTO, NotificationType.PROJETO_ATUALIZADO, managerUser);

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void employeeUserShouldOnlyAccessOwnNotifications() {
        UserDTO employeeUser = new UserDTO();
        employeeUser.setId(2L);
        employeeUser.setName("Employee User");
        employeeUser.setEmail("employee@example.com");
        employeeUser.setCargo("Employee");

        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(2L, PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        assertEquals(user.getId(), result.getContent().get(0).getUser().getId());
    }

    @Test
    void userShouldNotAccessOtherUsersNotifications() {
        User otherUser = new User();
        otherUser.setId(3L);

        when(userRepository.findById(3L)).thenReturn(Optional.of(otherUser));
        when(notificationRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.findById(2L));
    }

    // este não vai passar, pois exige websockets cujo processo assenta na comunicação em tempo real, que não é fácil de simular neste contexto.
    @Test
    void sendNotificationThroughWebSocket() {
        NotificationInsertDTO dto = new NotificationInsertDTO();
        dto.setUserId(1L);
        dto.setContent("Test Content");
        dto.setType("TEST");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any())).thenReturn(notification);

        notificationService.insert(dto);

        verify(messagingTemplate).convertAndSend(
                eq("/topic/notifications/1"),
                any(NotificationResponseDTO.class)
        );
    }

    @Test
    void insertShouldValidateRequiredFields() {
        NotificationInsertDTO emptyDto = new NotificationInsertDTO();
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        doThrow(new IllegalArgumentException()).when(notificationRepository).save(any());

        assertThrows(IllegalArgumentException.class, () -> notificationService.insert(emptyDto));
    }

    @Test
    void findByUserShouldHandleLargeDatasets() {
        List<Notification> largeNotificationList = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            Notification n = new Notification();
            n.setId((long) i);
            n.setUser(user);
            largeNotificationList.add(n);
        }

        Page<Notification> page = new PageImpl<>(largeNotificationList);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.findByUser(eq(user), any(Pageable.class))).thenReturn(page);

        Page<NotificationResponseDTO> result = notificationService.findByUser(1L, PageRequest.of(0, 100));

        assertEquals(100, result.getTotalElements());
    }

    @ParameterizedTest
    @DisplayName("Should create notifications with different types")
    @ValueSource(strings = {"PROJETO_ATUALIZADO", "TAREFA_ATRIBUIDA", "NOTIFICACAO_GERAL"})
    void shouldCreateNotificationWithDifferentTypes(String notificationType) {
        // Update mock notification to use the parameter type
        notification.setType(notificationType);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationInsertDTO dto = new NotificationInsertDTO();
        dto.setType(notificationType);
        dto.setUserId(1L);
        dto.setContent("Test Content");

        NotificationResponseDTO result = notificationService.insert(dto);

        assertNotNull(result);
        assertEquals(notificationType, result.getType());
    }

}
