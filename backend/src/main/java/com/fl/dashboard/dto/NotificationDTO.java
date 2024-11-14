package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class NotificationDTO {

    private Long id;
    private String type;
    private String content;
    private Boolean isRead;
    private Date createdAt;
    private Long relatedId;
    private Long userId;
    private Tarefa tarefa;
    private Projeto projeto;

    public NotificationDTO() {
    }

    public NotificationDTO(Long id, String type, String content, Boolean isRead,
                           Date createdAt, Long relatedId, Long userId,
                           Tarefa tarefa, Projeto projeto) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.relatedId = relatedId;
        this.userId = userId;
        this.tarefa = tarefa;
        this.projeto = projeto;
    }

}
