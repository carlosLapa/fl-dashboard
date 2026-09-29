package com.fl.dashboard.services;

import com.fl.dashboard.enums.ChatEventType;
import com.fl.dashboard.events.ChatNotificationEvent;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@Tag("unit")
@DisplayName("Mattermost Service Tests")
class MattermostServiceTest {

    private static final String WEBHOOK = "https://chat.example.com/hooks/abc";

    private MattermostService service(boolean enabled, String webhook, String types) {
        return new MattermostService(enabled, webhook, "https://app.example.com/", "FL Dashboard", types);
    }

    private ChatNotificationEvent event(ChatEventType type, String linkPath, String autor) {
        Map<String, String> campos = new LinkedHashMap<>();
        campos.put("Estado", "Em Progresso");
        campos.put("Colaboradores", "Ana, Bruno");
        return new ChatNotificationEvent(type, "Rever caderno", linkPath, campos, autor);
    }

    @Test
    void shouldBeDisabledWithoutWebhookEvenIfEnabledFlagIsSet() {
        MattermostService service = service(true, "  ", "");

        assertFalse(service.isEnabled());
        assertFalse(service.shouldSend(ChatEventType.TAREFA_CRIADA));
    }

    @Test
    void shouldOnlySendConfiguredTypes() {
        MattermostService service = service(true, WEBHOOK, "TAREFA_CRIADA, PROJETO_CONCLUIDO,NAO_EXISTE");

        assertTrue(service.shouldSend(ChatEventType.TAREFA_CRIADA));
        assertTrue(service.shouldSend(ChatEventType.PROJETO_CONCLUIDO));
        assertFalse(service.shouldSend(ChatEventType.TAREFA_EDITADA));
    }

    @Test
    void emptyTypeListShouldSendEverything() {
        MattermostService service = service(true, WEBHOOK, "");

        for (ChatEventType type : ChatEventType.values()) {
            assertTrue(service.shouldSend(type), type.name());
        }
    }

    @Test
    void disabledServiceShouldIgnoreEventsWithoutError() {
        MattermostService service = service(false, WEBHOOK, "");

        assertDoesNotThrow(() -> service.onChatNotification(event(ChatEventType.TAREFA_CRIADA, null, null)));
    }

    @Test
    @SuppressWarnings("unchecked")
    void buildPayloadShouldProduceSingleAttachmentWithLinkFieldsAndAuthor() {
        MattermostService service = service(true, WEBHOOK, "");

        Map<String, Object> payload = service.buildPayload(
                event(ChatEventType.TAREFA_STATUS_ALTERADO, "/projetos/7/full", "Carlos"));

        assertEquals("FL Dashboard", payload.get("username"));
        List<Map<String, Object>> attachments = (List<Map<String, Object>>) payload.get("attachments");
        assertEquals(1, attachments.size());

        Map<String, Object> attachment = attachments.get(0);
        assertEquals("Estado da tarefa alterado", attachment.get("author_name"));
        assertEquals("Rever caderno", attachment.get("title"));
        // Trailing slash on the configured app URL must not produce a double slash.
        assertEquals("https://app.example.com/projetos/7/full", attachment.get("title_link"));
        assertEquals(ChatEventType.TAREFA_STATUS_ALTERADO.getColor(), attachment.get("color"));
        assertEquals("Por Carlos", attachment.get("footer"));

        List<Map<String, Object>> fields = (List<Map<String, Object>>) attachment.get("fields");
        assertEquals(2, fields.size());
        assertEquals("Estado", fields.get(0).get("title"));
        assertEquals(true, fields.get(0).get("short"));
        assertEquals(false, fields.get(1).get("short"));
    }

    @Test
    void buildPayloadShouldOmitLinkAndFooterWhenAbsent() {
        MattermostService service = service(true, WEBHOOK, "");

        @SuppressWarnings("unchecked")
        Map<String, Object> attachment = ((List<Map<String, Object>>) service.buildPayload(
                event(ChatEventType.TAREFA_REMOVIDA, null, null)).get("attachments")).get(0);

        assertFalse(attachment.containsKey("title_link"));
        assertFalse(attachment.containsKey("footer"));
    }
}
