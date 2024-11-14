package com.fl.dashboard.dto;

import lombok.Data;

import java.util.Date;

@Data
public class NotificationResponseDTO {
    private Long id;
    private String type;
    private String content;
    private Boolean isRead;
    private Date createdAt;
    private Long relatedId;
    private UserMinDTO user;
    private TarefaMinDTO tarefa;
    private ProjetoMinDTO projeto;
}

