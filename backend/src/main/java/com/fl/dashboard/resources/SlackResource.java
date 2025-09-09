package com.fl.dashboard.resources;

import com.fl.dashboard.services.SlackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/slack")
public class SlackResource {

    @Autowired
    private SlackService slackService;

    /**
     * Endpoint para testar envio de mensagem simples para o Slack
     */
    @PostMapping("/test")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> testSlackIntegration(@RequestBody Map<String, String> payload) {
        String message = payload.getOrDefault("message", "Teste de integração com Slack");
        boolean success = slackService.sendMessage(message);

        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Mensagem enviada com sucesso" : "Falha ao enviar mensagem"
        ));
    }

    /**
     * Endpoint para verificar o status do webhook do Slack
     */
    @GetMapping("/webhook-status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> checkWebhook() {
        Map<String, Object> result = new HashMap<>();

        result.put("enabled", slackService.isEnabled());
        result.put("webhookConfigured", !slackService.getWebhookUrl().equals("empty") && !slackService.getWebhookUrl().equals("null"));
        result.put("defaultChannel", slackService.getDefaultChannel());

        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint para verificar o status geral da integração com o Slack
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSlackStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("enabled", slackService.isEnabled());
        status.put("defaultChannel", slackService.getDefaultChannel());
        status.put("webhookConfigured", !slackService.getWebhookUrl().equals("empty") && !slackService.getWebhookUrl().equals("null"));
        status.put("notificationTypes", slackService.getNotificationTypes());

        return ResponseEntity.ok(status);
    }
}