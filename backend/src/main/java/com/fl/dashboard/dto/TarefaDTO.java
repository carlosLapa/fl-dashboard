package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.FrequenciaRecorrencia;
import com.fl.dashboard.enums.TarefaStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fl.dashboard.utils.DiasUteis;
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

    private Long faseId;

    // Deviation data (read-only, see Tarefa#registarTempos). diasReais is the working days from
    // prazoEstimado to dataConclusao, counted like workingDays; null until the tarefa is DONE.
    private Integer diasEstimados;
    private LocalDateTime dataConclusao;
    private Integer diasReais;
    // Review time kept apart from work time: diasTrabalho = diasReais - diasEmRevisao (never
    // negative), and the deviation is measured on diasTrabalho.
    private LocalDateTime entradaRevisao;
    private Integer diasEmRevisao;
    private Integer devolucoes;
    private Integer diasTrabalho;

    private List<TarefaLinkDTO> links = new ArrayList<>();

    private List<RequisicaoEquipamentoDTO> requisicoes = new ArrayList<>();

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
        this.faseId = entity.getFase() != null ? entity.getFase().getId() : null;
        this.diasEstimados = entity.getDiasEstimados();
        this.dataConclusao = entity.getDataConclusao();
        this.diasReais = DiasUteis.contar(entity.getPrazoEstimado(), entity.getDataConclusao());
        this.entradaRevisao = entity.getEntradaRevisao();
        this.diasEmRevisao = entity.getDiasEmRevisao() != null ? entity.getDiasEmRevisao() : 0;
        this.devolucoes = entity.getDevolucoes() != null ? entity.getDevolucoes() : 0;
        this.diasTrabalho = this.diasReais != null ? Math.max(this.diasReais - this.diasEmRevisao, 0) : null;
        this.links = entity.getLinks() != null
                ? entity.getLinks().stream().map(TarefaLinkDTO::new).toList()
                : new ArrayList<>();
        this.requisicoes = entity.getRequisicoes() != null
                ? entity.getRequisicoes().stream().map(RequisicaoEquipamentoDTO::new).toList()
                : new ArrayList<>();
    }

}
