package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
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

}
