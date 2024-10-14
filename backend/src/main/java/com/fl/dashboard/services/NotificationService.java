package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationDTO;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
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

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";
    private static final String TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION = "Sending notification through WebSocket: {}";
    private static final String TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND = "Notification not found";
    private static final String USER_NOT_FOUND = "User not found";

    @Autowired
    private NotificationRepository repository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TarefaRepository tarefaRepository;
    @Autowired
    private ProjetoRepository projetoRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        logger.info("Sending notification to user {}: {}", userId, notification);
        messagingTemplate.convertAndSendToUser(userId.toString(), TOPIC_NOTIFICATIONS, notification);
        logger.info("Notification sent to user {}", userId);
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findAllPaged(Pageable pageable) {
        logger.info("Fetching notifications from database");
        Page<Notification> page = repository.findAll(pageable);
        logger.info("Found {} notifications", page.getTotalElements());
        return page.map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public NotificationDTO findById(Long id) {
        Notification notification = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        return convertToDTO(notification);
    }

    @Transactional
    public NotificationDTO insert(NotificationInsertDTO dto) {
        Notification notification = new Notification();
        copyInsertDtoToEntity(dto, notification);
        notification = repository.save(notification);
        NotificationDTO savedDto = convertToDTO(notification);

        // Send notification through WebSocket
        logger.info(TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION, savedDto);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, savedDto);
        logger.info("Notification sent through WebSocket");
        sendNotificationToUser(savedDto.getUserId(), savedDto);

        return savedDto;
    }

    @Transactional
    public NotificationDTO update(Long id, NotificationUpdateDTO dto) {
        Notification notification = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        copyUpdateDtoToEntity(dto, notification);
        notification = repository.save(notification);
        NotificationDTO updatedDto = convertToDTO(notification);

        // Send updated notification through WebSocket
        logger.info(TOPIC_NOTIFICATIONS_SENDING_NOTIFICATION, updatedDto);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, updatedDto);
        logger.info("Notification sent through WebSocket");
        sendNotificationToUser(updatedDto.getUserId(), updatedDto);

        return updatedDto;
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(notification.getId(), notification.getType(), notification.getContent(),
                notification.getIsRead(), notification.getCreatedAt(), notification.getRelatedId(),
                notification.getUser().getId(),
                notification.getTarefa() != null ? notification.getTarefa().getId() : null,
                notification.getProjeto() != null ? notification.getProjeto().getId() : null);
    }

    private void copyInsertDtoToEntity(NotificationInsertDTO dto, Notification entity) {
        entity.setType(dto.getType());
        entity.setContent(dto.getContent());
        entity.setIsRead(dto.getIsRead());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setRelatedId(dto.getRelatedId());
        // Set user, tarefa, and projeto based on IDs
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

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(TOPIC_NOTIFICATIONS_NOTIFICATION_NOT_FOUND));
        notification.setIsRead(true);
        notification = repository.save(notification);

        // Send updated notification through WebSocket
        logger.info("Sending notification through WebSocket: {}", notification);
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, convertToDTO(notification));
        logger.info("Notification sent through WebSocket");
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findByUser(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(USER_NOT_FOUND));
        Page<Notification> page = repository.findByUser(user, pageable);
        return page.map(this::convertToDTO);
    }

}
