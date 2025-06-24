package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import lombok.Data;

@Data
public class ProjetoMinDTO {
    private Long id;
    private String designacao;
    private String status;

    public ProjetoMinDTO() {
    }

    // Add this constructor
    public ProjetoMinDTO(Projeto entity) {
        this.id = entity.getId();
        this.designacao = entity.getDesignacao();
        this.status = entity.getStatus();
    }
}

