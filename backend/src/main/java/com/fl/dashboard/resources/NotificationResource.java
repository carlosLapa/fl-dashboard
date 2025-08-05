package com.fl.dashboard.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationResponseDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.dto.WebSocketMessage;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.services.NotificationService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/notifications")
@Tag(name = "Notifications", description = "Endpoints for managing notifications")
public class NotificationResource {

    private static final Logger logger = LoggerFactory.getLogger(NotificationResource.class);
    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @Operation(summary = "Handle WebSocket notification", description = "Process notification received via WebSocket")
    @MessageMapping("/send-notification")
    @SendTo("/topic/notifications")
    public void handleNotification(WebSocketMessage message) {
        logger.info("Received notification message via WebSocket: {}", message);
        try {
            if (message.getType().equals("NOTIFICATION")) {
                NotificationInsertDTO notificationDTO = objectMapper.convertValue(
                        message.getContent(),
                        NotificationInsertDTO.class
                );
                notificationService.insert(notificationDTO);
            }
        } catch (ResourceNotFoundException e) {
            // Log and swallow expected race condition exceptions
            logger.debug("Expected race condition during notification creation: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Error processing notification", e);
            throw new RuntimeException("Failed to process notification", e);
        }
    }

    @Operation(summary = "Get all notifications", description = "Retrieve all notifications with pagination")
    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> findAll(Pageable pageable) {
        logger.info("Received request to fetch all notifications");
        Page<NotificationResponseDTO> list = notificationService.findAllPaged(pageable);
        logger.info("Returning {} notifications", list.getTotalElements());
        return ResponseEntity.ok().body(list);
    }

    @Operation(summary = "Get notification by ID", description = "Retrieve a specific notification by its ID")
    @GetMapping(value = "/{id}")
    public ResponseEntity<NotificationResponseDTO> findById(@PathVariable Long id) {
        NotificationResponseDTO dto = notificationService.findById(id);
        return ResponseEntity.ok().body(dto);
    }

    @Operation(summary = "Get all user notifications", description = "Retrieve all notifications for a specific user")
    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<NotificationResponseDTO>> findAllByUserId(@PathVariable Long userId) {
        // Now returns only first 100 notifications for efficiency
        List<NotificationResponseDTO> notifications = notificationService.findAllByUserId(userId);
        return ResponseEntity.ok().body(notifications);
    }

    @Operation(summary = "Get detailed user notifications", description = "Retrieve all notifications with details for a specific user")
    @GetMapping("/user/{userId}/details")
    public ResponseEntity<Page<NotificationResponseDTO>> getAllNotificationsWithDetails(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> page = notificationService.findAllByUserIdWithDetails(userId, pageable);
        return ResponseEntity.ok(page);
    }

    @Operation(summary = "Create new notification", description = "Creates a notification with one of the following types: " +
            "TAREFA_ATRIBUIDA, TAREFA_STATUS_ALTERADO, TAREFA_PRAZO_PROXIMO, TAREFA_CONCLUIDA, NOTIFICACAO_GERAL, PROJETO_ATUALIZADO")
    @PostMapping
    public ResponseEntity<NotificationResponseDTO> insert(@Valid @RequestBody NotificationInsertDTO dto) {
        validateNotificationType(dto.getType());
        logger.info("Received POST request to create notification: {}", dto);
        NotificationResponseDTO notificationDTO = notificationService.insert(dto);
        logger.info("Notification created: {}", notificationDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(notificationDTO.getId()).toUri();
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, notificationDTO);

        return ResponseEntity.created(uri).body(notificationDTO);
    }

    @Operation(summary = "Update notification", description = "Update an existing notification")
    @PutMapping(value = "/{id}")
    public ResponseEntity<NotificationResponseDTO> update(@PathVariable Long id, @Valid @RequestBody NotificationUpdateDTO dto) {
        if (dto.getType() != null) {
            validateNotificationType(dto.getType());
        }
        NotificationResponseDTO newDto = notificationService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @Operation(summary = "Delete notification", description = "Delete a specific notification by its ID")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get unread notifications", description = "Retrieve all unread notifications for a specific user")
    @GetMapping("user/{userId}/unread")
    public ResponseEntity<Page<NotificationResponseDTO>> findUnreadByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> notifications = notificationService.findUnreadByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }

    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Mark multiple notifications as read", description = "Mark multiple notifications as read")
    @PatchMapping("/read")
    public ResponseEntity<Void> markMultipleAsRead(@RequestBody List<Long> ids) {
        notificationService.markMultipleAsRead(ids);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get user notifications", description = "Retrieve all notifications for a specific user with pagination")
    @GetMapping("user/{userId}")
    public ResponseEntity<Page<NotificationResponseDTO>> findByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> notifications = notificationService.findByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }

    private void validateNotificationType(String type) {
        try {
            NotificationType.valueOf(type);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid notification type: " + type + ". Valid types are: " +
                    String.join(", ", Arrays.stream(NotificationType.values())
                            .map(Enum::name)
                            .collect(Collectors.toList())));
        }
    }

    @Operation(summary = "Delete all user notifications", description = "Delete all notifications for a specific user")
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteAllForUser(@PathVariable Long userId) {
        notificationService.deleteAllForUser(userId);
        return ResponseEntity.noContent().build();
    }

}

