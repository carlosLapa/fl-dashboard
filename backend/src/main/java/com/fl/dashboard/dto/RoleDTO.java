package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Role;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class RoleDTO {

    private Long id;
    private String authority;

    public RoleDTO() {
    }

    public RoleDTO(Long id, String authority) {
        this.id = id;
        this.authority = authority;
    }

    public RoleDTO(Role entity) {
        id = entity.getId();
        authority = entity.getAuthority();
    }
}
