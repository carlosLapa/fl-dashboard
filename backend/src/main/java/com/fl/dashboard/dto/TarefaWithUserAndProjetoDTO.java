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
                    .map(UserDTO::new)
                    .collect(Collectors.toSet());
        }

        // Safely initialize and map projeto
        if (entity.getProjeto() != null) {
            Hibernate.initialize(entity.getProjeto());
            this.projeto = new ProjetoDTO(entity.getProjeto());
        }

        // Map externos
        if (entity.getExternos() != null) {
            this.externos = entity.getExternos().stream()
                    .map(externo -> {
                        ExternoDTO externoDTO = new ExternoDTO();
                        externoDTO.setId(externo.getId());
                        externoDTO.setName(externo.getName());
                        externoDTO.setEmail(externo.getEmail());
                        externoDTO.setTelemovel(externo.getTelemovel());
                        externoDTO.setPreco(externo.getPreco());
                        externoDTO.setFaseProjeto(externo.getFaseProjeto());
                        externoDTO.setEspecialidades(externo.getEspecialidades());
                        return externoDTO;
                    })
                    .collect(Collectors.toSet());
        }

    }
}