package com.fl.dashboard.dto;

import com.fl.dashboard.entities.ProjetoFase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProjetoFaseDTO {

    private Long id;

    // Read-only: taken from the URL on writes, never from the body.
    private Long projetoId;

    @NotBlank(message = "Campo requerido")
    @Size(max = 100, message = "O nome da fase não pode ter mais de 100 caracteres")
    private String nome;

    @Size(max = 255, message = "A descrição não pode ter mais de 255 caracteres")
    private String descricao;

    private LocalDate dataInicio;

    private LocalDate dataFim;

    // Optional on create (appended at the end when missing); reordering goes through PUT .../fases/ordem.
    private Integer ordem;

    public ProjetoFaseDTO() {
    }

    public ProjetoFaseDTO(ProjetoFase entity) {
        this.id = entity.getId();
        this.projetoId = entity.getProjeto().getId();
        this.nome = entity.getNome();
        this.descricao = entity.getDescricao();
        this.dataInicio = entity.getDataInicio();
        this.dataFim = entity.getDataFim();
        this.ordem = entity.getOrdem();
    }
}
