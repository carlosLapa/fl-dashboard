package com.fl.dashboard.dto;

import com.fl.dashboard.enums.FrequenciaRecorrencia;
import com.fl.dashboard.enums.TarefaStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class TarefaUpdateDTO {
    private Long id;
    private String descricao;
    private String prioridade;
    private Date prazoEstimado;
    private Date prazoReal;
    private Long projetoId;
    private Set<Long> userIds;
    private TarefaStatus status;
    private Integer workingDays;
    private Set<Long> externoIds;
    private Long version;
    private Boolean recorrente;
    private FrequenciaRecorrencia frequenciaRecorrencia;
    private Date dataFimRecorrencia;

    // Jackson only calls setFaseId when the field is in the body (also for an explicit null), so
    // faseIdEnviado tells "remove the phase" (faseId: null) apart from "this client doesn't know about
    // phases" (field absent). Without it, every older form that saves a tarefa would wipe its phase.
    private Long faseId;

    @JsonIgnore
    @Setter(AccessLevel.NONE)
    private boolean faseIdEnviado;

    public void setFaseId(Long faseId) {
        this.faseId = faseId;
        this.faseIdEnviado = true;
    }

    @Valid
    private List<TarefaLinkDTO> links;

    @Valid
    private List<RequisicaoEquipamentoDTO> requisicoes;
}
