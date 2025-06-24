package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Cliente;
import com.fl.dashboard.entities.Projeto;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ClienteWithProjetosDTO extends ClienteDTO {
    private Set<ProjetoMinDTO> projetos = new HashSet<>();

    public ClienteWithProjetosDTO() {
        super();
    }

    public ClienteWithProjetosDTO(Cliente entity) {
        super(entity);
        Hibernate.initialize(entity.getProjetos());
        this.projetos = entity.getProjetos().stream()
                .map(ProjetoMinDTO::new)
                .collect(Collectors.toSet());
    }

    public ClienteWithProjetosDTO(Cliente entity, Set<Projeto> projetos) {
        super(entity);
        this.projetos = projetos.stream()
                .map(ProjetoMinDTO::new)
                .collect(Collectors.toSet());
    }
}

