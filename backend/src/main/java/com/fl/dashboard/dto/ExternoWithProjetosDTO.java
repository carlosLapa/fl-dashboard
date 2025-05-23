package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Projeto;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ExternoWithProjetosDTO extends ExternoDTO {
    private Set<ProjetoDTO> projetos = new HashSet<>();

    public ExternoWithProjetosDTO(Externo entity) {
        super(entity);
        Hibernate.initialize(entity.getProjetos()); // Ensures the projetos collection is properly loaded
        this.projetos = entity.getProjetos().stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toSet());
    }

    public ExternoWithProjetosDTO(Externo entity, Set<Projeto> projetos) {
        super(entity);
        this.projetos = projetos.stream()
                .map(ProjetoDTO::new)
                .collect(Collectors.toSet());
    }
}
