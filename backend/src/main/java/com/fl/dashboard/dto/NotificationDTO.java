package com.fl.dashboard.dto;

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
    private Long tarefaId;
    private Long projetoId;

    public NotificationDTO() {
    }

    public NotificationDTO(Long id, String type, String content, Boolean isRead, Date createdAt, Long relatedId, Long userId, Long tarefaId, Long projetoId) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.relatedId = relatedId;
        this.userId = userId;
        this.tarefaId = tarefaId;
        this.projetoId = projetoId;
    }

}
