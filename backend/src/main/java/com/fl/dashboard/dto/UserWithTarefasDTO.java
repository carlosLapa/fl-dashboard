package com.fl.dashboard.dto;

import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserWithTarefasDTO extends UserDTO {
    private Set<TarefaDTO> tarefas = new HashSet<>();

    public UserWithTarefasDTO(User entity) {
        super(entity);
        this.tarefas = entity.getTarefas().stream()
                .map(TarefaDTO::new)
                .collect(Collectors.toSet());
    }
}
