package com.fl.dashboard.dto;

import com.fl.dashboard.entities.RequisicaoEquipamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RequisicaoEquipamentoDTO {

    private Long id;

    @NotNull(message = "Equipamento é obrigatório")
    private Long equipamentoId;

    // Read-only, for display: ignored on input, the equipamento is resolved from equipamentoId.
    private String equipamentoNome;
    private Boolean equipamentoAtivo;

    @NotNull(message = "Data de início é obrigatória")
    private LocalDate dataInicio;

    @NotNull(message = "Data de fim é obrigatória")
    private LocalDate dataFim;

    @Size(max = 255, message = "Observações devem ter no máximo 255 caracteres")
    private String observacoes;

    public RequisicaoEquipamentoDTO() {
    }

    public RequisicaoEquipamentoDTO(RequisicaoEquipamento entity) {
        this.id = entity.getId();
        this.equipamentoId = entity.getEquipamento().getId();
        this.equipamentoNome = entity.getEquipamento().getNome();
        this.equipamentoAtivo = entity.getEquipamento().getAtivo();
        this.dataInicio = entity.getDataInicio();
        this.dataFim = entity.getDataFim();
        this.observacoes = entity.getObservacoes();
    }
}
