package com.fl.dashboard.services;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Date;
import java.util.List;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";
    private static final String TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION = "Sending notification through WebSocket: {}";
    private static final String TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND = "Notification not found";
    private static final String TOPIC_NOTIFICATIONS_NOTIFICATION_SENT = "Notification sent";
    private static final String USER_NOT_FOUND = "User not found";

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TarefaRepository tarefaRepository;
    @Autowired
    private ProjetoRepository projetoRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private SlackService slackService;

    private NotificationResponseDTO convertToDTO(Notification notification) {
        if (notification == null) {
            return null;
        }

        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedId(notification.getRelatedId());

        // Eager loading of user data
        if (notification.getUser() != null) {
            UserMinDTO userDto = new UserMinDTO();
            userDto.setId(notification.getUser().getId());
            userDto.setName(notification.getUser().getName());
            dto.setUser(userDto);
        }

        // Eager loading of project data
        if (notification.getProjeto() != null) {
            ProjetoMinDTO projetoDto = new ProjetoMinDTO();
            projetoDto.setId(notification.getProjeto().getId());
            projetoDto.setDesignacao(notification.getProjeto().getDesignacao());
            projetoDto.setStatus(notification.getProjeto().getStatus());
            dto.setProjeto(projetoDto);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findPagedByUserId(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException(USER_NOT_FOUND);
        }
        Page<Notification> page = notificationRepository.findByUserIdWithDetails(userId, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findAllPaged(Pageable pageable) {
        logger.info("Fetching notifications from database");
        Page<Notification> page = notificationRepository.findAll(pageable);
        logger.info("Found {} notifications", page.getTotalElements());
        return page.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public NotificationResponseDTO findById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        return convertToDTO(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> findAllByUserId(Long userId) {
        // Use paginated query and fetch only first page (for legacy compatibility)
        Page<Notification> page = notificationRepository.findByUserIdWithDetails(userId, Pageable.ofSize(100));
        return page.getContent().stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findAllByUserIdWithDetails(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findAllByUserIdWithDetails(userId, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional
    public NotificationResponseDTO insert(NotificationInsertDTO dto) {
        Notification notification = new Notification();
        copyInsertDtoToEntity(dto, notification);
        logger.info("Attempting to save notification: {}", notification);

        try {
            notification = notificationRepository.save(notification);
            logger.info("Notification saved successfully: {}", notification);
        } catch (Exception e) {
            logger.error("Error saving notification", e);
            throw e;
        }

        NotificationResponseDTO savedDto = convertToDTO(notification);
        logger.info("Converted NotificationResponseDTO: {}", savedDto);

        // Register WebSocket send after transaction commits
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS + "/" + dto.getUserId(), savedDto);
                logger.info("Notification sent to topic successfully after transaction commit");

                // Adicione esta parte para integração com Slack
                try {
                    // Enviar para o Slack se o tipo de notificação estiver habilitado
                    if (slackService.shouldSendNotificationType(savedDto.getType())) {
                        String title = getTitleForNotificationType(savedDto.getType());
                        String color = slackService.getColorForNotificationType(savedDto.getType());
                        slackService.sendNotification(title, savedDto.getContent(), color);
                    }
                } catch (Exception e) {
                    logger.error("Error sending notification to Slack", e);
                }
            }
        });

        return savedDto;
    }

    /**
     * Obter um título amigável para o tipo de notificação
     */
    private String getTitleForNotificationType(String type) {
        if (type == null) return "Notificação";

        return switch (type) {
            case "TAREFA_ATRIBUIDA" -> "Nova Tarefa Atribuída";
            case "TAREFA_STATUS_ALTERADO" -> "Status de Tarefa Alterado";
            case "TAREFA_PRAZO_PROXIMO" -> "Prazo de Tarefa Próximo";
            case "TAREFA_CONCLUIDA" -> "Tarefa Concluída";
            case "PROJETO_ATRIBUIDO" -> "Projeto Atribuído";
            case "PROJETO_ATUALIZADO" -> "Projeto Atualizado";
            case "PROJETO_CONCLUIDO" -> "Projeto Concluído";
            case "NOTIFICACAO_GERAL" -> "Notificação";
            default -> "Notificação";
        };
    }

    @Transactional
    public NotificationResponseDTO update(Long id, NotificationUpdateDTO dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        copyUpdateDtoToEntity(dto, notification);
        notification = notificationRepository.save(notification);
        NotificationResponseDTO updatedDto = convertToDTO(notification);

        logger.info(TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION, updatedDto);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, updatedDto);
        logger.info(TOPIC_NOTIFICATIONS_NOTIFICATION_SENT);

        return updatedDto;
    }

    public void handleWebSocketNotification(WebSocketMessage message) {
        logger.info("Received WebSocket message: {}", message);
        if ("NOTIFICATION".equals(message.getType())) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                NotificationInsertDTO notificationDTO = mapper.convertValue(message.getContent(), NotificationInsertDTO.class);

                Notification notification = new Notification();
                copyInsertDtoToEntity(notificationDTO, notification);
                notification = notificationRepository.save(notification);
                logger.info("Notification processed and saved: {}", notification);

                NotificationResponseDTO responseDto = convertToDTO(notification);
                messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS + "/" + notificationDTO.getUserId(), responseDto);

            } catch (Exception e) {
                logger.error("Error processing notification: {}", e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findUnreadByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = notificationRepository.findByUserAndIsReadFalse(user, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        notification.setIsRead(true);
        notification = notificationRepository.save(notification);

        logger.info(TOPIC_NOTIFICATIONS_NOTIFICATION_SENT + ": {}", notification);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, convertToDTO(notification));
        logger.info("Notification sent through WebSocket");
    }

    @Transactional
    public void markMultipleAsRead(List<Long> ids) {
        List<Notification> notifications = notificationRepository.findAllById(ids);
        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
        notifications.forEach(notification -> {
            NotificationResponseDTO dto = convertToDTO(notification);
            messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, dto);
        });
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = notificationRepository.findByUser(user, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional
    public NotificationResponseDTO processNotification(NotificationInsertDTO notification) {
        logger.info("Processing notification: {}", notification);
        return insert(notification);
    }

    private void copyInsertDtoToEntity(NotificationInsertDTO dto, Notification entity) {
        entity.setType(dto.getType());
        entity.setContent(dto.getContent());
        entity.setIsRead(dto.getIsRead());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setRelatedId(dto.getRelatedId());

        if (dto.getUserId() != null) {
            logger.info("Setting user with ID: {}", dto.getUserId());
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
            entity.setUser(user);
        }

        // Only set Tarefa if it's a task-related notification and tarefaId is provided
        if (dto.getTarefaId() != null && isTaskRelatedNotification(dto.getType())) {
            Tarefa tarefa = tarefaRepository.findById(dto.getTarefaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));
            entity.setTarefa(tarefa);
        }

        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
            entity.setProjeto(projeto);
        }
    }

    private boolean isTaskRelatedNotification(String type) {
        return NotificationType.valueOf(type) == NotificationType.TAREFA_STATUS_ALTERADO ||
                NotificationType.valueOf(type) == NotificationType.TAREFA_ATRIBUIDA ||
                NotificationType.valueOf(type) == NotificationType.TAREFA_CONCLUIDA ||
                NotificationType.valueOf(type) == NotificationType.TAREFA_PRAZO_PROXIMO;
    }

    private void copyUpdateDtoToEntity(NotificationUpdateDTO dto, Notification entity) {
        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getContent() != null) entity.setContent(dto.getContent());
        if (dto.getIsRead() != null) entity.setIsRead(dto.getIsRead());
        if (dto.getCreatedAt() != null) entity.setCreatedAt(dto.getCreatedAt());
        if (dto.getRelatedId() != null) entity.setRelatedId(dto.getRelatedId());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
            entity.setUser(user);
        }

        if (dto.getTarefaId() != null) {
            Tarefa tarefa = tarefaRepository.findById(dto.getTarefaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));
            entity.setTarefa(tarefa);
        }

        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
            entity.setProjeto(projeto);
        }
    }

    @Transactional
    public NotificationResponseDTO createTaskStatusNotification(User user, Tarefa tarefa) {
        if (notificationRepository.existsByTarefaIdAndUserIdAndType(
                tarefa.getId(), user.getId(), NotificationType.TAREFA_STATUS_ALTERADO.name())) {
            logger.info("Task status notification already exists for task {} and user {}", tarefa.getId(), user.getId());
            return null;
        }
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.TAREFA_STATUS_ALTERADO.name());
        notification.setContent("O estado da tarefa '" + tarefa.getDescricao() + "' foi alterado para " + tarefa.getStatus());
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setTarefaId(tarefa.getId());
        return insert(notification);
    }

    @Transactional
    public NotificationResponseDTO createTaskAssignmentNotification(User user, Tarefa tarefa) {
        if (notificationRepository.existsByTarefaIdAndUserIdAndType(
                tarefa.getId(), user.getId(), NotificationType.TAREFA_ATRIBUIDA.name())) {
            logger.info("Task assignment notification already exists for task {} and user {}", tarefa.getId(), user.getId());
            return null;
        }
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.TAREFA_ATRIBUIDA.name());
        notification.setContent("Nova tarefa atribuída: " + tarefa.getDescricao());
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setTarefaId(tarefa.getId());
        return insert(notification);
    }

    @Transactional
    public NotificationResponseDTO createTaskCompletionNotification(User user, Tarefa tarefa) {
        if (notificationRepository.existsByTarefaIdAndUserIdAndType(
                tarefa.getId(), user.getId(), NotificationType.TAREFA_CONCLUIDA.name())) {
            logger.info("Task completion notification already exists for task {} and user {}", tarefa.getId(), user.getId());
            return null;
        }
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.TAREFA_CONCLUIDA.name());
        notification.setContent("A tarefa '" + tarefa.getDescricao() + "' foi concluída");
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setTarefaId(tarefa.getId());
        return insert(notification);
    }

    public NotificationResponseDTO createProjectNotification(NotificationInsertDTO dto) {
        try {
            Notification notification = new Notification();
            copyInsertDtoToEntity(dto, notification);
            notification = notificationRepository.save(notification);
            NotificationResponseDTO responseDTO = convertToDTO(notification);

            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/notifications", responseDTO);
            }

            return responseDTO;
        } catch (Exception e) {
            logger.error("Error creating project notification", e);
            throw new ResourceNotFoundException("Error creating notification");
        }
    }

    @Transactional
    public NotificationResponseDTO createProjectUpdateNotification(User user, Projeto projeto) {
        if (notificationRepository.existsByProjetoIdAndUserIdAndType(
                projeto.getId(), user.getId(), NotificationType.PROJETO_ATUALIZADO.name())) {
            logger.info("Project update notification already exists for project {} and user {}", projeto.getId(), user.getId());
            return null;
        }
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.PROJETO_ATUALIZADO.name());
        notification.setContent("O projeto '" + projeto.getDesignacao() + "' foi atualizado");
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setProjetoId(projeto.getId());
        return insert(notification);
    }

    // Método necessário? Após testes, reverificar.
    @Transactional
    public NotificationResponseDTO createGeneralNotification(User user, String content) {
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.NOTIFICACAO_GERAL.name());
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        return insert(notification);
    }

    @Transactional
    public NotificationResponseDTO createTaskDeadlineNotification(User user, Tarefa tarefa) {
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.TAREFA_PRAZO_PROXIMO.name());
        notification.setContent("A tarefa '" + tarefa.getDescricao() + "' está próxima do prazo de conclusão: " + tarefa.getPrazoReal());
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setTarefaId(tarefa.getId());
        return insert(notification);
    }

    @Transactional
    public void createProjectNotification(ProjetoWithUsersDTO projeto, NotificationType type, UserDTO user) {
        // Verify project exists first
        Projeto projetoEntity = projetoRepository.findById(projeto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));

        // Check for existing notification
        if (notificationRepository.existsByProjetoIdAndUserIdAndType(
                projeto.getId(),
                user.getId(),
                type.toString())) {
            logger.info("Notification already exists for project {} and user {}", projeto.getId(), user.getId());
            return;
        }

        User userEntity = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));

        Notification notification = new Notification();
        notification.setType(type.toString());
        notification.setUser(userEntity);
        notification.setProjeto(projetoEntity);
        notification.setContent(buildNotificationContent(type, projeto.getDesignacao()));
        notification.setCreatedAt(new Date());
        notification.setIsRead(false);

        try {
            Notification savedNotification = notificationRepository.save(notification);
            NotificationResponseDTO responseDTO = convertToDTO(savedNotification);
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), responseDTO);
            logger.info("Project notification created successfully for user {} and project {}",
                    user.getId(), projeto.getId());
        } catch (Exception e) {
            logger.error("Error creating project notification", e);
            throw e;
        }
    }

    private String buildNotificationContent(NotificationType type, String designacao) {
        return switch (type) {
            case PROJETO_ATRIBUIDO -> "Novo projeto atribuído: " + designacao;
            case PROJETO_ATUALIZADO -> "Projeto atualizado: " + designacao;
            case PROJETO_CONCLUIDO -> "Projeto concluído: " + designacao;
            default -> "Notificação do Projeto: " + designacao;
        };
    }

    public void delete(Long id) {
        try {
            notificationRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException("Id not found " + id);
        }
    }

    @Transactional
    public void deleteAllForUser(Long userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }

        // Delete all notifications for this user
        notificationRepository.deleteAllByUserId(userId);

        logger.info("Deleted all notifications for user with ID: {}", userId);
    }

    public boolean existsDeadlineNotification(Long tarefaId, Long userId) {
        return notificationRepository.existsByTarefaIdAndUserIdAndType(
                tarefaId, userId, NotificationType.TAREFA_PRAZO_PROXIMO.name()
        );
    }

}
