package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Cliente;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteMinDTO {
    private Long id;
    private String name;

    public ClienteMinDTO(Cliente entity) {
        this.id = entity.getId();
        this.name = entity.getName();
    }
}
