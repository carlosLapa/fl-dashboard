package com.fl.dashboard.resources;

import com.fl.dashboard.dto.SlackGroupedNotificationDTO;
import com.fl.dashboard.dto.TarefaWithUsersDTO;
import com.fl.dashboard.services.SlackService;
import com.fl.dashboard.services.TarefaService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/slack")
public class SlackResource {

    private static final Logger logger = LoggerFactory.getLogger(SlackResource.class);

    @Autowired
    private SlackService slackService;

    @Autowired
    private TarefaService tarefaService;

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

    @PostMapping("/test-grouped")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> testGroupedNotification(@RequestBody Map<String, Object> payload) {
        try {
            // Validação básica
            if (!payload.containsKey("tarefaId")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "É necessário fornecer o ID da tarefa"
                ));
            }

            Long tarefaId = Long.valueOf(payload.get("tarefaId").toString());

            // Buscar a tarefa com users usando o método extraído
            TarefaWithUsersDTO tarefaDTO = fetchTarefaWithUsers(tarefaId);
            if (tarefaDTO == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Tarefa não encontrada"
                ));
            }

            String title = (String) payload.getOrDefault("title", "Teste de Notificação Agrupada");
            String type = (String) payload.getOrDefault("type", "TAREFA_ATRIBUIDA");

            // Criar a notificação agrupada
            SlackGroupedNotificationDTO notification = new SlackGroupedNotificationDTO(type, title, tarefaDTO);

            // Adicionar conteúdo adicional se fornecido
            if (payload.containsKey("additionalContent")) {
                notification.setAdditionalContent((String) payload.get("additionalContent"));
            }

            // Enviar notificação
            boolean success = slackService.sendGroupedNotification(notification);

            return ResponseEntity.ok(Map.of(
                    "success", success,
                    "message", success ? "Notificação agrupada enviada com sucesso" : "Falha ao enviar notificação agrupada"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erro: " + e.getMessage()
            ));
        }
    }

    /**
     * Método auxiliar para buscar uma tarefa com os seus users
     *
     * @param tarefaId ID da tarefa a ser buscada
     * @return TarefaWithUsersDTO ou null se não encontrada
     */
    private TarefaWithUsersDTO fetchTarefaWithUsers(Long tarefaId) {
        try {
            return tarefaService.findByIdWithUsers(tarefaId);
        } catch (ResourceNotFoundException e) {
            logger.warn("Tarefa não encontrada: ID={}, erro={}", tarefaId, e.getMessage());
            return null;
        }


    }
}