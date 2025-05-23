package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Externo;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ExternoWithTarefasDTO extends ExternoDTO {
    private Set<TarefaDTO> tarefas = new HashSet<>();

    public ExternoWithTarefasDTO(Externo entity) {
        super(entity);
        Hibernate.initialize(entity.getTarefas()); // Ensures the tarefas collection is properly loaded
        this.tarefas = entity.getTarefas().stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toSet());
    }
}
