package com.fl.dashboard.resources;

import com.fl.dashboard.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private NotificationService notificationService;

    @MessageMapping("/ws-notifications")
    @SendTo("/topic/notifications")
    public void handleNotification(com.fl.dashboard.dto.WebSocketMessage message) {
        notificationService.handleWebSocketNotification(message);
    }
}

