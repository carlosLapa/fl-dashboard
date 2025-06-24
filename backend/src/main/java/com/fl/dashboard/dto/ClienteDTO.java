package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Cliente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteDTO {
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String name;

    private String morada;

    @Size(max = 20, message = "NIF deve ter no máximo 20 caracteres")
    private String nif;

    @Size(max = 50, message = "Contacto deve ter no máximo 50 caracteres")
    private String contacto;

    private String responsavel;

    // Add constructor that takes a Cliente entity
    public ClienteDTO(Cliente entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.morada = entity.getMorada();
        this.nif = entity.getNif();
        this.contacto = entity.getContacto();
        this.responsavel = entity.getResponsavel();
    }
}
