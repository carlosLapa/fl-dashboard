package com.fl.dashboard.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.NotificationDTO;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.dto.WebSocketMessage;
import com.fl.dashboard.entities.Notification;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
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

    public void handleWebSocketNotification(WebSocketMessage message) {
        logger.info("Received WebSocket message: {}", message);
        if ("NOTIFICATION".equals(message.getType())) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                NotificationInsertDTO notificationDTO = mapper.convertValue(message.getContent(), NotificationInsertDTO.class);

                // Process the notification
                Notification notification = new Notification();
                copyInsertDtoToEntity(notificationDTO, notification);
                notification = notificationRepository.save(notification);
                logger.info("Notification processed and saved: {}", notification);

                // Send notification through WebSocket
                NotificationDTO savedDto = convertToDTO(notification);
                messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS + "/" + notificationDTO.getUserId(), savedDto);

            } catch (Exception e) {
                logger.error("Error processing notification: {}", e.getMessage());
                e.printStackTrace();
            }
        }
    }

    private void sendNotificationToUser(Long userId, NotificationDTO notificationDTO) {
        if (userId != null) {
            logger.info("Sending notification to user with ID: {}", userId);
            // Logic to send notification to the user
        } else {
            logger.warn("Cannot send notification, user ID is null");
        }
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findPagedByUserId(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = notificationRepository.findByUser(user, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findAllPaged(Pageable pageable) {
        logger.info("Fetching notifications from database");
        Page<Notification> page = notificationRepository.findAll(pageable);
        logger.info("Found {} notifications", page.getTotalElements());
        return page.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public NotificationDTO findById(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        return convertToDTO(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> findAllByUserId(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream().map(this::convertToDTO).toList();
    }

    @Transactional
    public NotificationDTO insert(NotificationInsertDTO dto) {
        Notification notification = new Notification();
        copyInsertDtoToEntity(dto, notification);
        logger.info("Attempting to save notification: {}", notification);

        try {
            notification = notificationRepository.save(notification);
            logger.info("Notification saved successfully: {}", notification);
        } catch (Exception e) {
            logger.error("Error saving notification", e);
            throw e; // Re-throw to ensure transaction rollback
        }

        NotificationDTO savedDto = convertToDTO(notification);
        logger.info("Converted NotificationDTO: {}", savedDto);

        // Send notification through WebSocket
        logger.info("Sending notification to topic: {}", TOPIC_NOTIFICATIONS);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, savedDto);
        logger.info("Notification sent to topic successfully");
        sendNotificationToUser(savedDto.getUserId(), savedDto);

        return savedDto;
    }

    @Transactional
    public NotificationDTO update(Long id, NotificationUpdateDTO dto) {
        Notification notification = notificationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        copyUpdateDtoToEntity(dto, notification);
        notification = notificationRepository.save(notification);
        NotificationDTO updatedDto = convertToDTO(notification);

        // Send updated notification through WebSocket
        logger.info(TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION, updatedDto);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, updatedDto);
        logger.info(TOPIC_NOTIFICATIONS_NOTIFICATION_SENT);
        sendNotificationToUser(updatedDto.getUserId(), updatedDto);

        return updatedDto;
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getType(),
                notification.getContent(),
                notification.getIsRead(),
                notification.getCreatedAt(),
                notification.getRelatedId(),
                notification.getUser() != null ? notification.getUser().getId() : null,
                notification.getTarefa() != null ? notification.getTarefa().getId() : null,
                notification.getProjeto() != null ? notification.getProjeto().getId() : null);
    }

    private void copyInsertDtoToEntity(NotificationInsertDTO dto, Notification entity) {
        entity.setType(dto.getType());
        entity.setContent(dto.getContent());
        entity.setIsRead(dto.getIsRead());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setRelatedId(dto.getRelatedId());

        if (dto.getUserId() != null) {
            logger.info("Attempting to find user with ID: {}", dto.getUserId());
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
            logger.info("User found: {}", user.getId());
            entity.setUser(user);
        } else {
            logger.warn("User ID is null in NotificationInsertDTO");
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

        logger.info("Notification entity after setting fields: {}", entity);
    }

    private void copyUpdateDtoToEntity(NotificationUpdateDTO dto, Notification entity) {
        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getContent() != null) entity.setContent(dto.getContent());
        if (dto.getIsRead() != null) entity.setIsRead(dto.getIsRead());
        if (dto.getCreatedAt() != null) entity.setCreatedAt(dto.getCreatedAt());
        if (dto.getRelatedId() != null) entity.setRelatedId(dto.getRelatedId());
        // Update user, tarefa, and projeto based on IDs if they are provided
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

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findUnreadByUser(Long userId, Pageable pageable) {
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

        // Send updated notification through WebSocket
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
            NotificationDTO dto = convertToDTO(notification);
            messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, dto);
            sendNotificationToUser(dto.getUserId(), dto);
        });
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = notificationRepository.findByUser(user, pageable);
        return page.map(this::convertToDTO);
    }

    @Transactional
    public NotificationDTO processNotification(NotificationDTO notification) {
        logger.info("Processing notification: {}", notification);

        // Perform any necessary processing here
        // For example, you might want to save the notification to the database
        NotificationInsertDTO insertDTO = convertToInsertDTO(notification);
        NotificationDTO processedNotification = insert(insertDTO);

        logger.info("Notification processed: {}", processedNotification);
        return processedNotification;
    }

    private NotificationInsertDTO convertToInsertDTO(NotificationDTO notificationDTO) {
        NotificationInsertDTO insertDTO = new NotificationInsertDTO();
        insertDTO.setType(notificationDTO.getType());
        insertDTO.setContent(notificationDTO.getContent());
        insertDTO.setIsRead(notificationDTO.getIsRead());
        insertDTO.setCreatedAt(notificationDTO.getCreatedAt());
        insertDTO.setRelatedId(notificationDTO.getRelatedId());
        insertDTO.setUserId(notificationDTO.getUserId());
        insertDTO.setTarefaId(notificationDTO.getTarefaId());
        insertDTO.setProjetoId(notificationDTO.getProjetoId());
        return insertDTO;
    }
}
