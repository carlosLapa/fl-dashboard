package com.fl.dashboard.dto;

import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserWithRolesDTO extends UserDTO {

    private Set<RoleDTO> roles = new HashSet<>();

    public UserWithRolesDTO() {
        super();
    }

    public UserWithRolesDTO(User entity) {
        super(entity);
        Hibernate.initialize(entity.getRoles()); // Ensures the roles collection is properly loaded
        this.roles = entity.getRoles().stream()
                .map(RoleDTO::new)
                .collect(Collectors.toSet());
    }
}