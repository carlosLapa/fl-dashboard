package com.fl.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A project task that adds nothing to the project's total time, with the
 * reason(s) why, so the user can fix it (fill in the dates or assign someone).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TarefaNaoContadaDTO {

    private Long tarefaId;
    private String descricao;

    /** True when workingDays is null, i.e. prazoEstimado and/or prazoReal is missing. */
    private boolean semDatas;

    /** True when the task has no assigned collaborator (0 person-days). */
    private boolean semColaborador;
}
