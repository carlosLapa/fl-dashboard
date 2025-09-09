package com.fl.dashboard.resources;

import com.fl.dashboard.services.SlackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/slack")
public class SlackResource {

    @Autowired
    private SlackService slackService;

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

    @PostMapping("/test-rich")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> testRichSlackIntegration(@RequestBody Map<String, Object> payload) {
        String title = (String) payload.getOrDefault("title", "Notificação Rica");
        String message = (String) payload.getOrDefault("message", "Esta é uma notificação rica de teste");
        String color = (String) payload.getOrDefault("color", "#36a64f");

        // Criar campos exemplo
        List<Map<String, String>> fields = new ArrayList<>();

        Map<String, String> field1 = new HashMap<>();
        field1.put("title", "Prioridade");
        field1.put("value", "Alta");
        fields.add(field1);

        Map<String, String> field2 = new HashMap<>();
        field2.put("title", "Status");
        field2.put("value", "Em Andamento");
        fields.add(field2);

        boolean success = slackService.sendRichNotification(title, message, color, fields);

        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Notificação rica enviada com sucesso" : "Falha ao enviar notificação rica"
        ));
    }
}
