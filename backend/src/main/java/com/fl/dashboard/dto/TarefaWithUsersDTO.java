package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class TarefaWithUsersDTO extends TarefaDTO {

    private Set<UserDTO> users = new HashSet<>();

    public TarefaWithUsersDTO(Tarefa entity) {
        super(entity);
        this.users = entity.getUsers().stream()
                .map(UserDTO::new)
                .collect(Collectors.toSet());
    }

}
