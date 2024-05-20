package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Departamento;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DepartamentoDTO {

    private Long id;
    private String designacao;
    private String descricao;

    public DepartamentoDTO() {
    }

    public DepartamentoDTO(Long id, String designacao, String descricao) {
        this.id = id;
        this.designacao = designacao;
        this.descricao = descricao;
    }

    public DepartamentoDTO(Departamento entity) {
        id = entity.getId();
        designacao = entity.getDesignacao();
        descricao = entity.getDescricao();
    }
}
