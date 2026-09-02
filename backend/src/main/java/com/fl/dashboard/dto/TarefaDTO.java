package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.FrequenciaRecorrencia;
import com.fl.dashboard.enums.TarefaStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

    private Integer workingDays;

    private LocalDateTime arquivadaEm;

    private Long version;

    private Boolean recorrente;

    private FrequenciaRecorrencia frequenciaRecorrencia;

    private Date dataFimRecorrencia;

    private Date proximaOcorrencia;

    private Long tarefaOrigemId;

    private List<TarefaLinkDTO> links = new ArrayList<>();

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

    // Add a new constructor with workingDays - since V2 migration
    public TarefaDTO(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal, TarefaStatus status, Integer workingDays) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
        this.status = status;
        this.workingDays = workingDays;
    }

    public TarefaDTO(Tarefa entity) {
        this.id = entity.getId();
        this.descricao = entity.getDescricao();
        this.prioridade = entity.getPrioridade();
        this.prazoEstimado = entity.getPrazoEstimado();
        this.prazoReal = entity.getPrazoReal();
        this.status = entity.getStatus();
        this.workingDays = entity.getWorkingDays();
        this.arquivadaEm = entity.getArquivadaEm();
        this.version = entity.getVersion();
        this.recorrente = entity.getRecorrente();
        this.frequenciaRecorrencia = entity.getFrequenciaRecorrencia();
        this.dataFimRecorrencia = entity.getDataFimRecorrencia();
        this.proximaOcorrencia = entity.getProximaOcorrencia();
        this.tarefaOrigemId = entity.getTarefaOrigemId();
        this.links = entity.getLinks() != null
                ? entity.getLinks().stream().map(TarefaLinkDTO::new).toList()
                : new ArrayList<>();
    }

}
