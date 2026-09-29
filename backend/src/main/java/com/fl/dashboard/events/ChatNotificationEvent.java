package com.fl.dashboard.events;

import com.fl.dashboard.enums.ChatEventType;

import java.util.Map;

/**
 * Immutable snapshot of a Tarefa/Projeto change, built inside the originating transaction so the
 * after-commit listener never touches lazy JPA associations (open-in-view is off).
 *
 * @param nome     tarefa descricao or projeto designacao
 * @param linkPath frontend path to the entity (e.g. "/projetos/5/details"), or null when there is
 *                 nothing to open (e.g. a removed entity)
 * @param campos   ordered label -> value pairs rendered as message fields
 * @param autor    name of the user who made the change, or null for system-triggered changes
 */
public record ChatNotificationEvent(
        ChatEventType type,
        String nome,
        String linkPath,
        Map<String, String> campos,
        String autor
) {
}
