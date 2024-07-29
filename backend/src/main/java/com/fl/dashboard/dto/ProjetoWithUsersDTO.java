package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ProjetoWithUsersDTO extends ProjetoDTO {

    private Set<UserDTO> users = new HashSet<>();

    public ProjetoWithUsersDTO() {
        super();
    }

    public ProjetoWithUsersDTO(Projeto entity) {
        super(entity);
        this.users = entity.getUsers().stream().map(UserDTO::new).collect(Collectors.toSet());
    }

    public ProjetoWithUsersDTO(Projeto entity, Set<User> users) {
        super(entity);
        this.users = users.stream().map(UserDTO::new).collect(Collectors.toSet());
    }
}
