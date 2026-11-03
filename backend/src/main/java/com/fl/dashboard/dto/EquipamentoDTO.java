package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Equipamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipamentoDTO {

    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String nome;

    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String descricao;

    private Boolean ativo;

    public EquipamentoDTO() {
    }

    public EquipamentoDTO(Equipamento entity) {
        this.id = entity.getId();
        this.nome = entity.getNome();
        this.descricao = entity.getDescricao();
        this.ativo = entity.getAtivo();
    }
}
