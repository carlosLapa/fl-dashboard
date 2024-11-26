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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private NotificationResponseDTO convertToDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRelatedId(notification.getRelatedId());

        if (notification.getUser() != null) {
            UserMinDTO userDto = new UserMinDTO();
            userDto.setId(notification.getUser().getId());
            userDto.setName(notification.getUser().getName());
            dto.setUser(userDto);
        }

        if (notification.getTarefa() != null) {
            TarefaMinDTO tarefaDto = new TarefaMinDTO();
            tarefaDto.setId(notification.getTarefa().getId());
            tarefaDto.setDescricao(notification.getTarefa().getDescricao());
            dto.setTarefa(tarefaDto);
        }

        if (notification.getProjeto() != null) {
            ProjetoMinDTO projetoDto = new ProjetoMinDTO();
            projetoDto.setId(notification.getProjeto().getId());
            projetoDto.setDesignacao(notification.getProjeto().getDesignacao());
            dto.setProjeto(projetoDto);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> findPagedByUserId(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = notificationRepository.findByUser(user, pageable);
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
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> findAllByUserIdWithDetails(Long userId) {
        List<Notification> notifications = notificationRepository.findAllByUserIdWithDetails(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .toList();
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

        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS + "/" + dto.getUserId(), savedDto);
        logger.info("Notification sent to topic successfully");

        return savedDto;
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
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.TAREFA_CONCLUIDA.name());
        notification.setContent("A tarefa '" + tarefa.getDescricao() + "' foi concluída");
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setTarefaId(tarefa.getId());
        return insert(notification);
    }

    @Transactional
    public NotificationResponseDTO createProjectUpdateNotification(User user, Projeto projeto) {
        NotificationInsertDTO notification = new NotificationInsertDTO();
        notification.setType(NotificationType.PROJETO_ATUALIZADO.name());
        notification.setContent("O projeto '" + projeto.getDesignacao() + "' foi atualizado");
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());
        notification.setUserId(user.getId());
        notification.setProjetoId(projeto.getId());
        return insert(notification);
    }

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

    public void delete(Long id) {
        // To implement or not?
    }
}
