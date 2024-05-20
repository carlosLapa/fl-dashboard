package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Especialidade;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class EspecialidadeDTO {

    private Long id;
    private String tipo;
    private String descricao;

    public EspecialidadeDTO() {
    }

    public EspecialidadeDTO(Long id, String tipo, String descricao) {
        this.id = id;
        this.tipo = tipo;
        this.descricao = descricao;
    }

    public EspecialidadeDTO(Especialidade entity) {
        id = entity.getId();
        tipo = entity.getTipo();
        descricao = entity.getDescricao();
    }

}
