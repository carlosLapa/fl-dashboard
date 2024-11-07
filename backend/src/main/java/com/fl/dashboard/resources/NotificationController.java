package com.fl.dashboard.resources;

import com.fl.dashboard.dto.NotificationDTO;
import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.NotificationUpdateDTO;
import com.fl.dashboard.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);
    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // WebSocket endpoints
    @MessageMapping("/notifications")
    @SendTo("/topic/notifications")
    public NotificationDTO sendNotification(NotificationDTO notification) {
        logger.info("Received WebSocket notification: {}", notification);
        try {
            // Process the notification
            NotificationDTO processedNotification = notificationService.processNotification(notification);
            logger.info("Sending processed notification to topic: {}", TOPIC_NOTIFICATIONS);
            return processedNotification;
        } catch (Exception e) {
            logger.error("Error processing notification", e);
            // You might want to send an error message back to the client
            return new NotificationDTO(null, "ERROR", "Failed to process notification", false, new Date(), null, null, null, null);
        }
    }

    @MessageMapping("/send-notification")
    @SendTo("/topic/notifications")
    public NotificationDTO handleNotification(NotificationInsertDTO notificationInsertDTO) {
        logger.info("Received notification insert request: {}", notificationInsertDTO);
        try {
            NotificationDTO result = notificationService.insert(notificationInsertDTO);
            logger.info("Sending inserted notification to topic: {}", TOPIC_NOTIFICATIONS);
            return result;
        } catch (Exception e) {
            logger.error("Error inserting notification", e);
            // You might want to send an error message back to the client
            return new NotificationDTO(null, "ERROR", "Failed to insert notification", false, new Date(), null, null, null, null);
        }
    }


    @MessageMapping("/**")
    public void handleAnyMessage(Message<?> message) {
        logger.info("Received message on any destination: {}", message);
    }

    // REST endpoints
    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> findAll(Pageable pageable) {
        logger.info("Received request to fetch all notifications");
        Page<NotificationDTO> list = notificationService.findAllPaged(pageable);
        logger.info("Returning {} notifications", list.getTotalElements());
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<NotificationDTO> findById(@PathVariable Long id) {
        NotificationDTO dto = notificationService.findById(id);
        return ResponseEntity.ok().body(dto);
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> insert(@RequestBody NotificationInsertDTO dto) {
        logger.info("Received POST request to create notification: {}", dto);
        NotificationDTO notificationDTO = notificationService.insert(dto);
        logger.info("Notification created: {}", notificationDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(notificationDTO.getId()).toUri();

        // Send to all subscribers
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, notificationDTO);

        return ResponseEntity.created(uri).body(notificationDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<NotificationDTO> update(@PathVariable Long id, @RequestBody NotificationUpdateDTO dto) {
        NotificationDTO newDto = notificationService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("user/{userId}/unread")
    public ResponseEntity<Page<NotificationDTO>> findUnreadByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationDTO> notifications = notificationService.findUnreadByUser(userId, pageable);
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
    public ResponseEntity<Page<NotificationDTO>> findByUser(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        Page<NotificationDTO> notifications = notificationService.findByUser(userId, pageable);
        return ResponseEntity.ok().body(notifications);
    }
}
