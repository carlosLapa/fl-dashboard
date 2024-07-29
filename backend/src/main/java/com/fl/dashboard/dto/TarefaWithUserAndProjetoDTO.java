package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class TarefaWithUserAndProjetoDTO extends TarefaDTO {

    private Set<UserDTO> users = new HashSet<>();
    private ProjetoDTO projeto;

    public TarefaWithUserAndProjetoDTO(Tarefa entity) {
        super(entity);
        this.users = entity.getUsers().stream().map(UserDTO::new).collect(Collectors.toSet());
        this.projeto = new ProjetoDTO(entity.getProjeto());
    }

}

