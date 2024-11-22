package com.fl.dashboard.resources;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationResponseDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.dto.WebSocketMessage;
import com.fl.dashboard.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/notifications")
public class NotificationResource {

    private static final Logger logger = LoggerFactory.getLogger(NotificationResource.class);
    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ObjectMapper objectMapper;

    @MessageMapping("/send-notification")
    @SendTo("/topic/notifications")
    public NotificationResponseDTO handleNotification(@Payload WebSocketMessage message) {
        logger.info("Received notification message via WebSocket: {}", message);
        try {
            ObjectMapper mapper = new ObjectMapper();
            NotificationInsertDTO notificationInsertDTO = mapper.convertValue(message.getContent(), NotificationInsertDTO.class);
            NotificationResponseDTO result = notificationService.insert(notificationInsertDTO);
            logger.info("Notification inserted successfully: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error inserting notification", e);
            throw new RuntimeException("Failed to insert notification", e);
        }
    }

    @MessageMapping("/**")
    public void handleAnyMessage(Message<?> message) {
        logger.info("Received message on any destination: {}", message);
    }

    @GetMapping
    public ResponseEntity<Page<NotificationResponseDTO>> findAll(Pageable pageable) {
        logger.info("Received request to fetch all notifications");
        Page<NotificationResponseDTO> list = notificationService.findAllPaged(pageable);
        logger.info("Returning {} notifications", list.getTotalElements());
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<NotificationResponseDTO> findById(@PathVariable Long id) {
        NotificationResponseDTO dto = notificationService.findById(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<NotificationResponseDTO>> findAllByUserId(@PathVariable Long userId) {
        List<NotificationResponseDTO> notifications = notificationService.findAllByUserId(userId);
        return ResponseEntity.ok().body(notifications);
    }

    @GetMapping("/user/{userId}/details")
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotificationsWithDetails(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findAllByUserIdWithDetails(userId));
    }

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> insert(@RequestBody NotificationInsertDTO dto) {
        logger.info("Received POST request to create notification: {}", dto);
        NotificationResponseDTO notificationDTO = notificationService.insert(dto);
        logger.info("Notification created: {}", notificationDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(notificationDTO.getId()).toUri();
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, notificationDTO);

        return ResponseEntity.created(uri).body(notificationDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<NotificationResponseDTO> update(@PathVariable Long id, @RequestBody NotificationUpdateDTO dto) {
        NotificationResponseDTO newDto = notificationService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("user/{userId}/unread")
    public ResponseEntity<Page<NotificationResponseDTO>> findUnreadByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> notifications = notificationService.findUnreadByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read")
    public ResponseEntity<Void> markMultipleAsRead(@RequestBody List<Long> ids) {
        notificationService.markMultipleAsRead(ids);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("user/{userId}")
    public ResponseEntity<Page<NotificationResponseDTO>> findByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> notifications = notificationService.findByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }
}

