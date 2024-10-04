package com.fl.dashboard.resources;

import com.fl.dashboard.dto.NotificationDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class NotificationWebSocketController {

    @MessageMapping("/notifications")
    @SendTo("/topic/notifications")
    public NotificationDTO sendNotification(NotificationDTO notification) {
        return notification;
    }
}
