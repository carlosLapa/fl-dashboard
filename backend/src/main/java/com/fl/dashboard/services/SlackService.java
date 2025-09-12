package com.fl.dashboard.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.dto.SlackGroupedNotificationDTO;
import com.fl.dashboard.dto.TarefaWithUsersDTO;
import com.fl.dashboard.dto.UserDTO;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class SlackService {

    private static final Logger logger = LoggerFactory.getLogger(SlackService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    // Mapa para rastrear notificações recentes e evitar duplicatas
    private final ConcurrentHashMap<String, Long> recentNotifications = new ConcurrentHashMap<>();

    // Scheduler para limpar notificações antigas periodicamente
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Value("${slack.webhook-url:}")
    private String webhookUrl;

    @Value("${slack.enabled:false}")
    private boolean enabled;

    @Value("${slack.default-channel:#fl-dashboard-notificacoes}")
    private String defaultChannel;

    @Value("${slack.notification-types:}")
    private List<String> notificationTypes;

    @PostConstruct
    public void initialize() {
        // Log de configuração inicial
        logger.info("Initializing Slack service with configuration:");
        logger.info("  - Enabled: {}", enabled);
        logger.info("  - Default Channel: {}", defaultChannel);
        logger.info("  - Webhook URL configured: {}", webhookUrl != null && !webhookUrl.isEmpty());
        logger.info("  - Notification Types: {}", notificationTypes);

        // Limpeza básica do webhook se necessário
        if (webhookUrl != null && (webhookUrl.startsWith(" ") || webhookUrl.endsWith(" "))) {
            webhookUrl = webhookUrl.trim();
        }

        // Configurar limpeza periódica de notificações antigas a cada 5 minutos
        scheduler.scheduleAtFixedRate(this::cleanupOldNotifications, 5, 5, TimeUnit.MINUTES);
    }

    /**
     * Limpa notificações antigas do registro para evitar crescimento ilimitado do mapa
     */
    private void cleanupOldNotifications() {
        try {
            long currentTime = System.currentTimeMillis();
            int beforeSize = recentNotifications.size();

            // Remover entradas mais antigas que 1 minuto
            recentNotifications.entrySet().removeIf(entry -> (currentTime - entry.getValue()) > 60000);

            int afterSize = recentNotifications.size();
            if (beforeSize != afterSize) {
                logger.debug("Cleaned up recent notifications cache: {} -> {} entries", beforeSize, afterSize);
            }
        } catch (Exception e) {
            logger.warn("Error cleaning up notification cache", e);
        }
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
        if (webhookUrl == null) {
            return "null";
        } else if (webhookUrl.isEmpty()) {
            return "empty";
        } else if (webhookUrl.startsWith("https://hooks.slack.com/")) {
            return "valid_format";
        } else {
            return "invalid_format";
        }
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
        if (!enabled || webhookUrl == null || webhookUrl.isEmpty()) {
            logger.info("Slack integration is disabled or webhook URL is not configured.");
            return false;
        }

        try {
            // Gerar uma chave única baseada na mensagem
            String messageKey = "simple-" + text.hashCode();

            // Verificar se já enviamos recentemente (últimos 10 segundos)
            long currentTime = System.currentTimeMillis();
            Long lastSent = recentNotifications.get(messageKey);
            if (lastSent != null && (currentTime - lastSent) < 10000) {
                logger.info("Skipping duplicate Slack message sent within last 10 seconds");
                return true; // Consideramos como sucesso, já que a mensagem já foi enviada
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("text", text);
            payload.put("channel", defaultChannel);
            payload.put("username", "FL Dashboard");
            payload.put("icon_emoji", ":chart_with_upwards_trend:");

            boolean result = sendPayloadToSlack(payload);

            // Se enviou com sucesso, registrar a mensagem como recentemente enviada
            if (result) {
                recentNotifications.put(messageKey, currentTime);
            }

            return result;
        } catch (Exception e) {
            logger.error("Error sending Slack message", e);
            return false;
        }
    }

    /**
     * Envia uma notificação formatada para o Slack
     * Implementa verificação de duplicatas baseada no conteúdo da mensagem
     */
    public boolean sendNotification(String title, String message, String color) {
        if (!enabled || webhookUrl == null || webhookUrl.isEmpty()) {
            logger.info("Slack notification not sent: integration disabled or webhook missing. Title: {}", title);
            return false;
        }

        try {
            // Gerar uma chave única baseada no título e conteúdo da mensagem
            String messageKey = title + "-" + message.hashCode();

            // Verificar se já enviamos recentemente (últimos 10 segundos)
            long currentTime = System.currentTimeMillis();
            Long lastSent = recentNotifications.get(messageKey);
            if (lastSent != null && (currentTime - lastSent) < 10000) {
                logger.info("Skipping duplicate Slack notification sent within last 10 seconds: {}", title);
                return true; // Consideramos como sucesso, já que a mensagem já foi enviada
            }

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
            boolean result = sendPayloadToSlack(payload);

            // Se enviou com sucesso, registrar a mensagem como recentemente enviada
            if (result) {
                recentNotifications.put(messageKey, currentTime);
            }

            return result;
        } catch (Exception e) {
            logger.error("Error sending Slack notification", e);
            return false;
        }
    }

    /**
     * Método auxiliar para enviar payload para o Slack
     */
    private boolean sendPayloadToSlack(Map<String, Object> payload) throws Exception {
        String jsonPayload = objectMapper.writeValueAsString(payload);

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

    /**
     * Envia uma notificação formatada ao Slack com suporte para agrupamento de users
     */
    public boolean sendGroupedNotification(SlackGroupedNotificationDTO notification) {
        logger.info("SlackService - sendGroupedNotification chamado para tarefa ID={}, tipo={}, título='{}'",
                notification.getTarefa().getId(), notification.getType(), notification.getTitle());

        TarefaWithUsersDTO tarefa = notification.getTarefa();
        String messageKey = notification.getType() + "-" + tarefa.getId();

        long currentTime = System.currentTimeMillis();
        Long lastSent = recentNotifications.get(messageKey);

        if (lastSent != null) {
            long timeSinceLastSent = currentTime - lastSent;
            logger.info("Encontrada notificação anterior para a mesma chave '{}' enviada há {} ms (limite: 30000 ms)",
                    messageKey, timeSinceLastSent);

            if (timeSinceLastSent < 30000) {
                logger.info("IGNORANDO notificação duplicada dentro do período de 30 segundos");
                return true; // Consideramos como sucesso, já que a mensagem já foi enviada
            }
        }

        if (!enabled || webhookUrl == null || webhookUrl.isEmpty()) {
            logger.info("Grouped Slack notification not sent: integration disabled or webhook missing. Title: {}",
                    notification.getTitle());
            return false;
        }

        try {
            tarefa = notification.getTarefa();

            // Construir a mensagem formatada
            StringBuilder content = new StringBuilder();

            // Adicionar informação do projeto se disponível
            if (notification.getProjeto() != null && notification.getProjeto().getDesignacao() != null) {
                content.append("*Projeto:* ").append(notification.getProjeto().getDesignacao()).append("\n\n");
                logger.debug("Incluindo projeto na notificação: {}", notification.getProjeto().getDesignacao());
            } else {
                logger.debug("Notificação sem informação de projeto");
            }

            // Resto do código permanece igual
            content.append("*Título:* ").append(tarefa.getDescricao()).append("\n");

            // Adicionar prazo se disponível
            if (tarefa.getPrazoReal() != null) {
                SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
                content.append("*Prazo:* ").append(dateFormat.format(tarefa.getPrazoReal())).append("\n");
            }

            // Adicionar prioridade se disponível
            if (tarefa.getPrioridade() != null && !tarefa.getPrioridade().isEmpty()) {
                content.append("*Prioridade:* ").append(tarefa.getPrioridade()).append("\n");
            }

            // Adicionar status
            content.append("*Status:* ").append(tarefa.getStatus()).append("\n");

            // Adicionar conteúdo adicional se houver
            if (notification.getAdditionalContent() != null && !notification.getAdditionalContent().isEmpty()) {
                content.append("\n").append(notification.getAdditionalContent()).append("\n");
            }

            // Adicionar lista de colaboradores
            Set<UserDTO> users = tarefa.getUsers();
            if (users != null && !users.isEmpty()) {
                content.append("\n*Colaboradores:* ");
                content.append(users.stream()
                        .map(UserDTO::getName)
                        .collect(Collectors.joining(", ")));
            }

            // Gerar uma chave única baseada no título e tarefa
            messageKey = notification.getType() + "-" + tarefa.getId();

            // Verificar se já enviamos recentemente (últimos 30 segundos)
            currentTime = System.currentTimeMillis();
            lastSent = recentNotifications.get(messageKey);
            if (lastSent != null && (currentTime - lastSent) < 30000) {
                logger.info("Skipping duplicate grouped Slack notification sent within last 30 seconds: {} for task {}",
                        notification.getTitle(), tarefa.getId());
                return true; // Consideramos como sucesso, já que a mensagem já foi enviada
            }

            String color = getColorForNotificationType(notification.getType());
            boolean result = sendNotification(notification.getTitle(), content.toString(), color);

            // Se enviou com sucesso, registrar a mensagem como recentemente enviada
            if (result) {
                recentNotifications.put(messageKey, currentTime);

                // Verificar se users é não nulo antes de chamar size()
                int usersCount = (users != null) ? users.size() : 0;

                logger.info("Successfully sent grouped notification for task {} with {} users",
                        tarefa.getId(), usersCount);
            }

            return result;
        } catch (Exception e) {
            logger.error("Error sending grouped Slack notification", e);
            return false;
        }
    }


}