package com.fl.dashboard.resources;

import com.fl.dashboard.services.SlackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
     * Endpoint para testar envio de mensagem formatada para o Slack
     */
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

    /**
     * Endpoint para diagnóstico da configuração do Slack
     */
    @GetMapping("/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSlackStatus() {
        Map<String, Object> status = new HashMap<>();

        // Informações gerais de configuração
        status.put("enabled", slackService.isEnabled());
        status.put("defaultChannel", slackService.getDefaultChannel());
        status.put("webhookConfigured", !slackService.getWebhookUrl().isEmpty());
        status.put("notificationTypes", slackService.getNotificationTypes());

        // Verificações específicas para diagnóstico
        List<Map<String, Object>> typeStatus = new ArrayList<>();
        for (String type : new String[]{
                "TAREFA_ATRIBUIDA", "TAREFA_STATUS_ALTERADO",
                "TAREFA_PRAZO_PROXIMO", "TAREFA_CONCLUIDA",
                "PROJETO_ATRIBUIDO", "PROJETO_ATUALIZADO", "PROJETO_CONCLUIDO",
                "NOTIFICACAO_GERAL"
        }) {
            Map<String, Object> typeInfo = new HashMap<>();
            typeInfo.put("type", type);
            typeInfo.put("shouldSend", slackService.shouldSendNotificationType(type));
            typeInfo.put("color", slackService.getColorForNotificationType(type));
            typeStatus.add(typeInfo);
        }
        status.put("typeConfigurations", typeStatus);

        return ResponseEntity.ok(status);
    }

    /**
     * Endpoint para testar a configuração enviando uma notificação específica
     */
    @PostMapping("/test-notification-type")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> testNotificationType(@RequestBody Map<String, String> payload) {
        String type = payload.getOrDefault("type", "NOTIFICACAO_GERAL");
        String message = payload.getOrDefault("message", "Teste de notificação do tipo " + type);

        boolean shouldSend = slackService.shouldSendNotificationType(type);

        Map<String, Object> result = new HashMap<>();
        result.put("type", type);
        result.put("shouldSend", shouldSend);

        if (shouldSend) {
            String title = getTitleForType(type);
            String color = slackService.getColorForNotificationType(type);
            boolean sent = slackService.sendNotification(title, message, color);
            result.put("sent", sent);
            result.put("message", sent ? "Notificação enviada com sucesso" : "Falha ao enviar notificação");
        } else {
            result.put("sent", false);
            result.put("message", "Tipo de notificação não configurado para envio ao Slack");
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Obtém um título para teste com base no tipo
     */
    private String getTitleForType(String type) {
        return switch (type) {
            case "TAREFA_ATRIBUIDA" -> "Nova Tarefa Atribuída";
            case "TAREFA_STATUS_ALTERADO" -> "Status de Tarefa Alterado";
            case "TAREFA_PRAZO_PROXIMO" -> "Prazo de Tarefa Próximo";
            case "TAREFA_CONCLUIDA" -> "Tarefa Concluída";
            case "PROJETO_ATRIBUIDO" -> "Projeto Atribuído";
            case "PROJETO_ATUALIZADO" -> "Projeto Atualizado";
            case "PROJETO_CONCLUIDO" -> "Projeto Concluído";
            case "NOTIFICACAO_GERAL" -> "Notificação";
            default -> "Notificação de Teste";
        };
    }
}