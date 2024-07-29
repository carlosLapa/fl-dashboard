package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
public class TarefaUpdateDTO {
    private Long id;  // Include the id for the tarefa to be updated
    private String descricao;
    private String status;
    private String prioridade;
    private Date prazoEstimado;
    private Date prazoReal;
    private Long projetoId;
    private Set<Long> userIds;
}
