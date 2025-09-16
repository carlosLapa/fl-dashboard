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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        String webhookStatus;
        if (webhookUrl == null) {
            webhookStatus = "null";
        } else if (webhookUrl.isEmpty()) {
            webhookStatus = "empty";
        } else {
            webhookStatus = "configured";
        }
        logger.info("  - Webhook URL: {}", webhookStatus);

        // Log detalhado da lista de tipos de notificação
        if (notificationTypes == null) {
            logger.info("  - Notification Types: null (todos os tipos serão enviados)");
        } else if (notificationTypes.isEmpty()) {
            logger.info("  - Notification Types: lista vazia (todos os tipos serão enviados)");
        } else {
            logger.info("  - Notification Types: {}", notificationTypes);
            logger.info("  - Contém TAREFA_STATUS_ALTERADO? {}", notificationTypes.contains("TAREFA_STATUS_ALTERADO"));
        }

        // Verificar se o webhook está vazio ou não configurado
        if (!enabled) {
            logger.warn("Slack integration is disabled. No messages will be sent.");
        } else if (webhookUrl == null || webhookUrl.isEmpty()) {
            logger.error("Slack integration is enabled but webhook URL is not configured!");
            logger.error("Please set SLACK_WEBHOOK environment variable or slack.webhook-url property");
        }

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
            // Use isErrorEnabled para verificar se o log será realmente escrito
            if (logger.isErrorEnabled()) {
                logger.error("Error sending to Slack. Status: {}, Body: {}",
                        response.statusCode(), response.body());
            }
            return false;
        }

        logger.info("Slack message sent successfully");
        return true;
    }

    /**
     * Verifica se o tipo de notificação deve ser enviado ao Slack
     */
    public boolean shouldSendNotificationType(String type) {
        logger.info("Verificando se deve enviar notificação de tipo: {}", type);
        logger.info("  - Slack habilitado: {}", enabled);
        logger.info("  - Tipos configurados: {}", notificationTypes);
        logger.info("  - Contém o tipo? {}",
                notificationTypes != null && notificationTypes.contains(type));

        boolean shouldSend = enabled &&
                (notificationTypes == null || notificationTypes.isEmpty() || notificationTypes.contains(type));

        logger.info("  - Resultado: {}", shouldSend);

        return shouldSend;
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

        // Definir a chave de mensagem, usando uniqueId se disponível
        String messageKey;
        if (notification.getUniqueId() != null && !notification.getUniqueId().isEmpty()) {
            // Se tiver uniqueId, usá-lo para evitar deduplicação
            messageKey = notification.getType() + "-" + tarefa.getId() + "-" + notification.getUniqueId();
            logger.info("Usando identificador único para notificação: {}", messageKey);
        } else {
            // Caso contrário, usar a chave padrão
            messageKey = notification.getType() + "-" + tarefa.getId();

            // Verificar se temos duplicação para notificações normais
            long currentTime = System.currentTimeMillis();
            Long lastSent = recentNotifications.get(messageKey);

            // Somente verificar duplicação para notificações que não são de alteração de status
            // ou que não têm ID único
            if (lastSent != null && !"TAREFA_STATUS_ALTERADO".equals(notification.getType())) {
                long timeSinceLastSent = currentTime - lastSent;
                logger.info("Encontrada notificação anterior para a mesma chave '{}' enviada há {} ms (limite: 30000 ms)",
                        messageKey, timeSinceLastSent);

                if (timeSinceLastSent < 30000) {
                    logger.info("IGNORANDO notificação duplicada dentro do período de 30 segundos");
                    return true; // Consideramos como sucesso, já que a mensagem já foi enviada
                }
            }
        }

        if (!enabled || webhookUrl == null || webhookUrl.isEmpty()) {
            logger.info("Grouped Slack notification not sent: integration disabled or webhook missing. Title: {}",
                    notification.getTitle());
            return false;
        }

        try {
            // Construir a mensagem formatada
            StringBuilder content = new StringBuilder();

            // Adicionar informação do projeto se disponível
            if (notification.getProjeto() != null && notification.getProjeto().getDesignacao() != null) {
                content.append("*Projeto:* ").append(notification.getProjeto().getDesignacao()).append("\n\n");
                logger.info("Incluindo projeto na notificação: {}", notification.getProjeto().getDesignacao());
            } else {
                logger.warn("Notificação sem informação de projeto");
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

            // SOLUÇÃO: Adicionar lista de colaboradores sem duplicação
            List<UserDTO> allUsers = notification.getAllUsers();
            if (allUsers != null && !allUsers.isEmpty()) {
                content.append("\n*Colaboradores:* ");
                content.append(allUsers.stream()
                        .map(UserDTO::getName)
                        .distinct()  // Elimina duplicações pelo nome
                        .collect(Collectors.joining(", ")));
            }

            String color = getColorForNotificationType(notification.getType());

            // Log dos dados antes de enviar
            String contentString = content.toString();
            String contentPreview = contentString.length() > 50 ? contentString.substring(0, 50) + "..." : contentString;

            logger.info("Enviando para Slack - Título: '{}', Conteúdo: '{}', Cor: '{}'",
                    notification.getTitle(),
                    contentPreview,
                    color);

            boolean result = sendNotification(notification.getTitle(), content.toString(), color);

            // Se enviou com sucesso, registrar a mensagem como recentemente enviada
            if (result) {
                recentNotifications.put(messageKey, System.currentTimeMillis());
                logger.info("Successfully sent grouped notification for task {} with {} users",
                        tarefa.getId(), allUsers != null ? allUsers.size() : 0);
            } else {
                logger.error("Failed to send grouped notification for task {}", tarefa.getId());
            }

            return result;
        } catch (Exception e) {
            logger.error("Error sending grouped Slack notification", e);
            return false;
        }
    }

    @PostConstruct
    public void debugNotificationTypes() {
        logger.info("Tipos de notificação configurados após @Value:");
        if (notificationTypes == null) {
            logger.info("  - notificationTypes é NULL");
        } else {
            logger.info("  - Quantidade: {}", notificationTypes.size());
            logger.info("  - Valores: {}", notificationTypes);
            for (String type : notificationTypes) {
                logger.info("  - Tipo: '{}'", type);
            }
        }
    }


}