package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ExternoWithTarefasDTO extends ExternoDTO {
    // Full DTO (users + projeto + externos) so the page can open TarefaModal and link to the
    // projeto's Kanban; the plain TarefaDTO had neither, and saving from the modal would have
    // sent an empty user list.
    private List<TarefaWithUserAndProjetoDTO> tarefas = new ArrayList<>();

    public ExternoWithTarefasDTO(Externo entity, List<Tarefa> activeTarefas) {
        super(entity);
        this.tarefas = activeTarefas.stream()
                .map(TarefaWithUserAndProjetoDTO::new)
                .toList();
    }
}
