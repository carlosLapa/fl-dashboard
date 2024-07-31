package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ProjetoWithUsersAndTarefasDTO extends ProjetoDTO {

    private Set<UserDTO> users = new HashSet<>();
    private Set<TarefaDTO> tarefas = new HashSet<>();

    public ProjetoWithUsersAndTarefasDTO() {
        super();
    }

    public ProjetoWithUsersAndTarefasDTO(Projeto entity) {
        super(entity);
        this.users = entity.getUsers().stream().map(UserDTO::new).collect(Collectors.toSet());
        this.tarefas = entity.getTarefas().stream().map(TarefaDTO::new).collect(Collectors.toSet());
    }

    public ProjetoWithUsersAndTarefasDTO(Projeto entity, Set<User> users, Set<Tarefa> tarefas) {
        super(entity);
        this.users = users.stream().map(UserDTO::new).collect(Collectors.toSet());
        this.tarefas = tarefas.stream().map(TarefaDTO::new).collect(Collectors.toSet());
    }
}

