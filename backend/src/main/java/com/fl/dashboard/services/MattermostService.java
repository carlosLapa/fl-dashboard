package com.fl.dashboard.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fl.dashboard.enums.ChatEventType;
import com.fl.dashboard.events.ChatNotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Posts {@link ChatNotificationEvent}s to a Mattermost channel through an incoming webhook.
 * <p>
 * Delivery happens only after the originating transaction commits (a rolled-back change posts
 * nothing) and the HTTP call is asynchronous with timeouts, so a slow or unreachable Mattermost
 * server never delays the user's request — failures are only logged.
 */
@Service
public class MattermostService {

    private static final Logger logger = LoggerFactory.getLogger(MattermostService.class);
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .build();

    private final boolean enabled;
    private final String webhookUrl;
    private final String appUrl;
    private final String username;
    private final Set<ChatEventType> notificationTypes;

    public MattermostService(
            @Value("${mattermost.enabled:false}") boolean enabled,
            @Value("${mattermost.webhook-url:}") String webhookUrl,
            @Value("${mattermost.app-url:}") String appUrl,
            @Value("${mattermost.username:FL Dashboard}") String username,
            @Value("${mattermost.notification-types:}") String notificationTypes) {
        this.webhookUrl = webhookUrl == null ? "" : webhookUrl.trim();
        this.enabled = enabled && !this.webhookUrl.isEmpty();
        this.appUrl = stripTrailingSlash(appUrl == null ? "" : appUrl.trim());
        this.username = username;
        this.notificationTypes = parseTypes(notificationTypes);

        if (enabled && this.webhookUrl.isEmpty()) {
            logger.error("Mattermost integration is enabled but MATTERMOST_WEBHOOK_URL is not set — nothing will be sent");
        }
        // Never log the webhook URL itself: it is the only credential protecting the channel.
        logger.info("Mattermost integration: enabled={}, types={}", this.enabled, this.notificationTypes);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean shouldSend(ChatEventType type) {
        return enabled && notificationTypes.contains(type);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onChatNotification(ChatNotificationEvent event) {
        if (!shouldSend(event.type())) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(buildPayload(event));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(webhookUrl))
                    .timeout(REQUEST_TIMEOUT)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .whenComplete((response, error) -> {
                        if (error != null) {
                            logger.warn("Mattermost notification {} failed: {}", event.type(), error.toString());
                        } else if (response.statusCode() != 200) {
                            logger.warn("Mattermost notification {} rejected: status={}, body={}",
                                    event.type(), response.statusCode(), response.body());
                        } else {
                            logger.debug("Mattermost notification {} sent", event.type());
                        }
                    });
        } catch (Exception e) {
            logger.warn("Could not send Mattermost notification {}", event.type(), e);
        }
    }

    /**
     * Builds the webhook body: a single colored attachment whose author line is the event label,
     * title is the Tarefa/Projeto name (linked into the app) and fields hold the details.
     * Mattermost renders standard Markdown, so bold is **x** (Slack's *x* would be italic here).
     */
    Map<String, Object> buildPayload(ChatNotificationEvent event) {
        ChatEventType type = event.type();

        List<Map<String, Object>> fields = new ArrayList<>();
        event.campos().forEach((label, value) -> {
            Map<String, Object> field = new LinkedHashMap<>();
            field.put("title", label);
            field.put("value", value == null || value.isBlank() ? "—" : value);
            field.put("short", !"Colaboradores".equals(label) && !"Adicionados".equals(label) && !"Removidos".equals(label));
            fields.add(field);
        });

        Map<String, Object> attachment = new LinkedHashMap<>();
        attachment.put("fallback", type.getLabel() + ": " + event.nome());
        attachment.put("color", type.getColor());
        attachment.put("author_name", type.getLabel());
        attachment.put("title", event.nome());
        if (event.linkPath() != null && !appUrl.isEmpty()) {
            attachment.put("title_link", appUrl + event.linkPath());
        }
        attachment.put("fields", fields);
        if (event.autor() != null) {
            attachment.put("footer", "Por " + event.autor());
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        // Only honored if "Enable integrations to override usernames" is on in the System Console;
        // otherwise Mattermost ignores it and shows the webhook creator's name.
        payload.put("username", username);
        payload.put("attachments", List.of(attachment));
        return payload;
    }

    private static Set<ChatEventType> parseTypes(String raw) {
        Set<ChatEventType> types = EnumSet.noneOf(ChatEventType.class);
        if (raw == null || raw.isBlank()) {
            // Same convention as the Slack integration: an empty list means "send everything".
            return EnumSet.allOf(ChatEventType.class);
        }
        Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .forEach(name -> {
                    try {
                        types.add(ChatEventType.valueOf(name));
                    } catch (IllegalArgumentException e) {
                        logger.warn("Ignoring unknown Mattermost notification type '{}'", name);
                    }
                });
        return types;
    }

    private static String stripTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
