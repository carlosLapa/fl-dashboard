package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserWithProjetosDTO extends UserDTO {

    private Set<ProjetoDTO> projetos = new HashSet<>();

    public UserWithProjetosDTO(User entity) {
        super(entity);
        Hibernate.initialize(entity.getProjetos()); //ensures the projetos collection is properly loaded within the transaction.
        this.projetos = entity.getProjetos().stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toSet());
    }

    public UserWithProjetosDTO(User entity, Set<Projeto> projetos) {
        super(entity);
        this.projetos = projetos.stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toSet());
    }
}
