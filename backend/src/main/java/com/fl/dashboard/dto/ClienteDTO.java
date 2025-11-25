package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Cliente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

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

    @NotNull(message = "Número é obrigatório")
    private Integer numero;

    // Keep old fields for backward compatibility
    @Size(max = 50, message = "Contacto deve ter no máximo 50 caracteres")
    private String contacto;

    private String responsavel;

    // New collection fields
    private List<String> contactos = new ArrayList<>();
    private List<String> responsaveis = new ArrayList<>();
    private List<String> emails = new ArrayList<>();

    // Constructor that takes a Cliente entity
    public ClienteDTO(Cliente entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.morada = entity.getMorada();
        this.nif = entity.getNif();
        this.numero = entity.getNumero();

        // Handle new collection fields
        this.contactos = entity.getContactos() != null ? new ArrayList<>(entity.getContactos()) : new ArrayList<>();
        this.responsaveis = entity.getResponsaveis() != null ? new ArrayList<>(entity.getResponsaveis()) : new ArrayList<>();
        this.emails = entity.getEmails() != null ? new ArrayList<>(entity.getEmails()) : new ArrayList<>();

        // For backward compatibility, set the first item in each collection to the old single field
        if (!this.contactos.isEmpty()) {
            this.contacto = this.contactos.get(0);
        }

        if (!this.responsaveis.isEmpty()) {
            this.responsavel = this.responsaveis.get(0);
        }
    }
}
