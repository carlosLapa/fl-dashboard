package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.TarefaStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@ToString
public class TarefaDTO {

    private Long id;

    @Size(min = 5, max = 200, message = "Designação deve conter de 5 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String descricao;

    private String prioridade;

    @FutureOrPresent(message = "Data deve ser no presente ou futuro")
    private Date prazoEstimado;

    @FutureOrPresent(message = "Data deve ser no presente ou futuro")
    private Date prazoReal;

    private TarefaStatus status;

    public TarefaDTO() {
    }

    public TarefaDTO(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal, TarefaStatus status) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
        this.status = status;
    }

    public TarefaDTO(Tarefa entity) {
        this.id = entity.getId();
        this.descricao = entity.getDescricao();
        this.prioridade = entity.getPrioridade();
        this.prazoEstimado = entity.getPrazoEstimado();
        this.prazoReal = entity.getPrazoReal();
        this.status = entity.getStatus();
    }

}
