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
    private Set<UserSummaryDTO> users = new HashSet<>();
    private ProjetoDTO projeto;
    private Set<ExternoDTO> externos;

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
                    .map(UserSummaryDTO::new)
                    .collect(Collectors.toSet());
        }

        // Safely initialize and map projeto
        if (entity.getProjeto() != null) {
            Hibernate.initialize(entity.getProjeto());
            this.projeto = new ProjetoDTO(entity.getProjeto());
        }

        // Map externos (via ExternoDTO's own constructor, which copies especialidades into a plain
        // HashSet instead of holding the live Hibernate-managed collection reference — building the
        // DTO field-by-field here used to bypass that and pass the raw proxy through)
        if (entity.getExternos() != null) {
            this.externos = entity.getExternos().stream()
                    .map(ExternoDTO::new)
                    .collect(Collectors.toSet());
        }

    }
}