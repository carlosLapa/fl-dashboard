package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Proposta;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PropostaMinDTO {
    private Long id;
    private String designacao;
    private String status;

    public PropostaMinDTO(Proposta entity) {
        this.id = entity.getId();
        this.designacao = entity.getDesignacao();
        this.status = entity.getStatus();
    }
}
