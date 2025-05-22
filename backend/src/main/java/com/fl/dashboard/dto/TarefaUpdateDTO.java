package com.fl.dashboard.dto;

import com.fl.dashboard.enums.TarefaStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
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
}
