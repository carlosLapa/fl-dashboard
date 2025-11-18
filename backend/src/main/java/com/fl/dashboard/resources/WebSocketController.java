package com.fl.dashboard.resources;

import com.fl.dashboard.services.NotificationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final NotificationService notificationService;

    public WebSocketController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @MessageMapping("/ws-notifications")
    @SendTo("/topic/notifications")
    public void handleNotification(com.fl.dashboard.dto.WebSocketMessage message) {
        notificationService.handleWebSocketNotification(message);
    }
}

