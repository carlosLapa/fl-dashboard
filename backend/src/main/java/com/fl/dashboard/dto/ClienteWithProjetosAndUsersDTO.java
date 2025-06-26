package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Cliente;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ClienteWithProjetosAndUsersDTO extends ClienteDTO {
    private Set<ProjetoWithUsersDTO> projetos = new HashSet<>();

    public ClienteWithProjetosAndUsersDTO() {
        super();
    }

    public ClienteWithProjetosAndUsersDTO(Cliente entity) {
        super(entity);
        this.projetos = entity.getProjetos().stream()
                .map(ProjetoWithUsersDTO::new)
                .collect(Collectors.toSet());
    }
}
