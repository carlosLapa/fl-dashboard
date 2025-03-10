package com.fl.dashboard.dto;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationInsertDTO {

    private String type;
    private String content;
    private Boolean isRead;
    private Date createdAt;
    private Long relatedId;
    private Long userId;
    private Long tarefaId;
    private Long projetoId;

}
