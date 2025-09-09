package com.fl.dashboard.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SlackService {

    private static final Logger logger = LoggerFactory.getLogger(SlackService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${slack.webhook-url:}")
    private String webhookUrl;

    @Value("${slack.enabled:false}")
    private boolean enabled;

    @Value("${slack.default-channel:#general}")
    private String defaultChannel;

    @Value("${slack.notification-types:}")
    private List<String> notificationTypes;

    @PostConstruct
    public void logConfiguration() {
        logger.info("Initializing Slack service with configuration:");
        logger.info("  - Enabled: {}", enabled);
        logger.info("  - Default Channel: {}", defaultChannel);
        logger.info("  - Webhook URL configured: {}", !webhookUrl.isEmpty());
        logger.info("  - Notification Types: {}", notificationTypes);
    }

    /**
     * Verifica se a integração com o Slack está habilitada
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Retorna a URL do webhook (ofuscada para logs)
     */
    public String getWebhookUrl() {
        // Retorna uma versão ofuscada para não expor a URL completa em logs
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            return "";
        }
        return "configured";
    }

    /**
     * Retorna o canal padrão configurado
     */
    public String getDefaultChannel() {
        return defaultChannel;
    }

    /**
     * Retorna os tipos de notificação configurados
     */
    public List<String> getNotificationTypes() {
        return notificationTypes;
    }

    /**
     * Envia uma mensagem básica para o Slack
     */
    public boolean sendMessage(String text) {
        if (!enabled || webhookUrl.isEmpty()) {
            logger.info("Slack integration is disabled or webhook URL is not configured.");
            return false;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("text", text);
            payload.put("channel", defaultChannel);
            payload.put("username", "FL Dashboard");
            payload.put("icon_emoji", ":chart_with_upwards_trend:");

            return sendPayloadToSlack(payload);
        } catch (Exception e) {
            logger.error("Error sending Slack message", e);
            return false;
        }
    }

    /**
     * Envia uma notificação formatada para o Slack
     */
    public boolean sendNotification(String title, String message, String color) {
        if (!enabled || webhookUrl.isEmpty()) {
            logger.info("Slack notification not sent: integration disabled or webhook missing. Title: {}", title);
            return false;
        }

        try {
            Map<String, Object> attachment = new HashMap<>();
            attachment.put("color", color != null ? color : "#36a64f");
            attachment.put("title", title);
            attachment.put("text", message);

            List<Map<String, Object>> attachments = new ArrayList<>();
            attachments.add(attachment);

            Map<String, Object> payload = new HashMap<>();
            payload.put("text", title);
            payload.put("attachments", attachments);
            payload.put("channel", defaultChannel);
            payload.put("username", "FL Dashboard");
            payload.put("icon_emoji", ":chart_with_upwards_trend:");

            logger.info("Sending notification to Slack. Title: '{}', Channel: '{}'", title, defaultChannel);
            return sendPayloadToSlack(payload);
        } catch (Exception e) {
            logger.error("Error sending Slack notification", e);
            return false;
        }
    }

    /**
     * Envia uma notificação formatada para o Slack com blocos
     */
    public boolean sendRichNotification(String title, String message, String color, List<Map<String, String>> fields) {
        if (!enabled || webhookUrl.isEmpty()) {
            return false;
        }

        try {
            // Criar blocos
            List<Map<String, Object>> blocks = new ArrayList<>();

            // Bloco de cabeçalho
            Map<String, Object> headerText = new HashMap<>();
            headerText.put("type", "plain_text");
            headerText.put("text", title);
            headerText.put("emoji", true);

            Map<String, Object> headerBlock = new HashMap<>();
            headerBlock.put("type", "header");
            headerBlock.put("text", headerText);
            blocks.add(headerBlock);

            // Bloco de texto
            Map<String, Object> textObj = new HashMap<>();
            textObj.put("type", "mrkdwn");
            textObj.put("text", message);

            Map<String, Object> textBlock = new HashMap<>();
            textBlock.put("type", "section");
            textBlock.put("text", textObj);
            blocks.add(textBlock);

            // Campos adicionais se fornecidos
            if (fields != null && !fields.isEmpty()) {
                List<Map<String, Object>> fieldObjects = new ArrayList<>();

                for (Map<String, String> field : fields) {
                    Map<String, Object> fieldObj = new HashMap<>();
                    fieldObj.put("type", "mrkdwn");
                    fieldObj.put("text", "*" + field.get("title") + "*\n" + field.get("value"));
                    fieldObjects.add(fieldObj);
                }

                Map<String, Object> fieldsBlock = new HashMap<>();
                fieldsBlock.put("type", "section");
                fieldsBlock.put("fields", fieldObjects);
                blocks.add(fieldsBlock);
            }

            // Criar payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("blocks", blocks);
            payload.put("channel", defaultChannel);
            payload.put("username", "FL Dashboard");
            payload.put("icon_emoji", ":chart_with_upwards_trend:");

            return sendPayloadToSlack(payload);
        } catch (Exception e) {
            logger.error("Error sending rich Slack notification", e);
            return false;
        }
    }

    /**
     * Método auxiliar para enviar payload para o Slack
     */
    private boolean sendPayloadToSlack(Map<String, Object> payload) throws Exception {
        String jsonPayload = objectMapper.writeValueAsString(payload);

        logger.debug("Sending payload to Slack: {}", jsonPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(webhookUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request,
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            logger.error("Error sending to Slack. Status: {}, Body: {}",
                    response.statusCode(), response.body());
            return false;
        }

        logger.info("Slack message sent successfully");
        return true;
    }

    /**
     * Verifica se o tipo de notificação deve ser enviado ao Slack
     */
    public boolean shouldSendNotificationType(String type) {
        return enabled &&
                (notificationTypes == null || notificationTypes.isEmpty() || notificationTypes.contains(type));
    }

    /**
     * Cores para diferentes tipos de notificação
     */
    public String getColorForNotificationType(String type) {
        if (type == null) return "#36a64f"; // verde padrão

        return switch (type) {
            case "TAREFA_ATRIBUIDA" -> "#3498db";      // Azul
            case "TAREFA_STATUS_ALTERADO" -> "#9b59b6"; // Roxo
            case "TAREFA_PRAZO_PROXIMO" -> "#e74c3c";  // Vermelho
            case "TAREFA_CONCLUIDA" -> "#2ecc71";      // Verde
            case "PROJETO_ATRIBUIDO" -> "#3498db";     // Azul
            case "PROJETO_ATUALIZADO" -> "#f39c12";    // Laranja
            case "PROJETO_CONCLUIDO" -> "#2ecc71";     // Verde
            case "NOTIFICACAO_GERAL" -> "#7f8c8d";     // Cinza escuro
            default -> "#95a5a6";                      // Cinza claro
        };
    }
}