package com.fl.dashboard.dto;

import com.fl.dashboard.entities.ProjetoUserHistory;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProjetoUserHistoryEventDTO {

    private Long id;
    private Long projetoId;
    private String projetoDesignacao;
    private String action; // "ADDED" | "REMOVED"
    private LocalDateTime eventDate;

    public ProjetoUserHistoryEventDTO() {
    }

    public ProjetoUserHistoryEventDTO(ProjetoUserHistory entity) {
        this.id = entity.getId();
        this.projetoId = entity.getProjeto().getId();
        this.projetoDesignacao = entity.getProjeto().getDesignacao();
        this.action = entity.getAction().name();
        this.eventDate = entity.getEventDate();
    }
}
