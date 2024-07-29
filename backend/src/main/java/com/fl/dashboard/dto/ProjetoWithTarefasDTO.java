package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ProjetoWithTarefasDTO extends ProjetoDTO {

    private Set<TarefaDTO> tarefas = new HashSet<>();

    public ProjetoWithTarefasDTO() {
        super();
    }

    public ProjetoWithTarefasDTO(Projeto entity) {
        super(entity);
        this.tarefas = entity.getTarefas().stream().map(TarefaDTO::new).collect(Collectors.toSet());
    }

    public ProjetoWithTarefasDTO(Projeto entity, Set<Tarefa> tarefas) {
        super(entity);
        this.tarefas = tarefas.stream().map(TarefaDTO::new).collect(Collectors.toSet());
    }
}
