package com.fl.dashboard.enums;

/**
 * Channel-level events posted to team chat (currently Mattermost). Deliberately separate from
 * {@link NotificationType}: those are per-recipient in-app notifications, whereas these describe
 * one change to a Tarefa/Projeto and are posted once to a shared channel.
 */
public enum ChatEventType {
    TAREFA_CRIADA("Nova tarefa", "#3498db"),
    TAREFA_EDITADA("Tarefa editada", "#f39c12"),
    TAREFA_COLABORADORES_ALTERADOS("Colaboradores da tarefa alterados", "#1abc9c"),
    TAREFA_PRAZO_PRORROGADO("Prazo da tarefa prorrogado", "#e67e22"),
    TAREFA_PRAZO_ALTERADO("Prazo da tarefa alterado", "#e67e22"),
    TAREFA_STATUS_ALTERADO("Estado da tarefa alterado", "#9b59b6"),
    TAREFA_CONCLUIDA("Tarefa concluída", "#2ecc71"),
    TAREFA_REMOVIDA("Tarefa removida", "#e74c3c"),
    TAREFA_RECORRENTE_CRIADA("Nova ocorrência de tarefa recorrente", "#3498db"),
    PROJETO_CRIADO("Novo projeto", "#2980b9"),
    PROJETO_EDITADO("Projeto editado", "#f39c12"),
    PROJETO_COLABORADORES_ALTERADOS("Colaboradores do projeto alterados", "#1abc9c"),
    PROJETO_STATUS_ALTERADO("Estado do projeto alterado", "#8e44ad"),
    PROJETO_CONCLUIDO("Projeto concluído", "#27ae60"),
    PROJETO_PRAZO_PRORROGADO("Prazo do projeto prorrogado", "#e67e22"),
    PROJETO_PRAZO_ALTERADO("Prazo do projeto alterado", "#e67e22"),
    PROJETO_REMOVIDO("Projeto removido", "#c0392b");

    private final String label;
    private final String color;

    ChatEventType(String label, String color) {
        this.label = label;
        this.color = color;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }
}
