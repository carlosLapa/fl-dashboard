package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class TarefaWithUserAndProjetoDTO extends TarefaDTO {
    private Set<UserDTO> users = new HashSet<>();
    private ProjetoDTO projeto;

    // Add a no-args constructor
    public TarefaWithUserAndProjetoDTO() {
        super();
    }

    public TarefaWithUserAndProjetoDTO(Tarefa entity) {
        super(entity);

        // Safely initialize and map users
        if (entity.getUsers() != null) {
            Hibernate.initialize(entity.getUsers());
            this.users = entity.getUsers().stream()
                    .map(UserDTO::new)
                    .collect(Collectors.toSet());
        }

        // Safely initialize and map projeto
        if (entity.getProjeto() != null) {
            Hibernate.initialize(entity.getProjeto());
            this.projeto = new ProjetoDTO(entity.getProjeto());
        }
    }
}