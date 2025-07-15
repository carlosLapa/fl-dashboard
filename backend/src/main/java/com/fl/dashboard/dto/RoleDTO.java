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
    private String role_type; // Add this field
    private String name;      // Add this field

    public RoleDTO() {
    }

    public RoleDTO(Long id, String authority) {
        this.id = id;
        this.authority = authority;
    }

    public RoleDTO(Role entity) {
        this.id = entity.getId();
        this.authority = entity.getAuthority();

        // Set both role_type and name to the enum value
        if (entity.getName() != null) {
            String enumValue = entity.getName().name(); // "ADMIN", "MANAGER", "EMPLOYEE"
            this.role_type = enumValue;
            this.name = enumValue;
        }
    }
}