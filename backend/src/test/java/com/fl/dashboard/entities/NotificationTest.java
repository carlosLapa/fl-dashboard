package com.fl.dashboard.entities;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NotificationTest {

    @Test
    void setContentKeepsShortContentUnchanged() {
        Notification notification = new Notification();
        notification.setContent("A tarefa 'X' foi concluída");
        assertEquals("A tarefa 'X' foi concluída", notification.getContent());
    }

    @Test
    void setContentKeepsNull() {
        Notification notification = new Notification();
        notification.setContent(null);
        assertNull(notification.getContent());
    }

    @Test
    void setContentKeepsContentAtExactLimit() {
        Notification notification = new Notification();
        String content = "a".repeat(Notification.CONTENT_MAX_LENGTH);
        notification.setContent(content);
        assertEquals(content, notification.getContent());
    }

    @Test
    void setContentTruncatesOverlongContentWithEllipsis() {
        Notification notification = new Notification();
        notification.setContent("a".repeat(400));
        assertEquals(Notification.CONTENT_MAX_LENGTH, notification.getContent().length());
        assertTrue(notification.getContent().endsWith("…"));
    }

    @Test
    void setContentDoesNotSplitSurrogatePair() {
        Notification notification = new Notification();
        // Places an emoji (two chars) across the cut point.
        String content = "a".repeat(Notification.CONTENT_MAX_LENGTH - 2) + "😀" + "b".repeat(10);
        notification.setContent(content);
        String result = notification.getContent();
        assertTrue(result.length() <= Notification.CONTENT_MAX_LENGTH);
        assertFalse(Character.isHighSurrogate(result.charAt(result.length() - 2)));
        assertTrue(result.endsWith("…"));
    }
}
