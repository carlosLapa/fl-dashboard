package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Proposta;
import com.fl.dashboard.entities.Cliente;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class PropostaWithClientesDTO extends PropostaDTO {

    private Set<ClienteDTO> clientes = new HashSet<>();

    public PropostaWithClientesDTO(Proposta entity) {
        super(entity);
        if (entity.getClientes() != null) {
            entity.getClientes().forEach(cliente -> this.clientes.add(new ClienteDTO(cliente)));
        }
    }

    public PropostaWithClientesDTO(Proposta entity, Set<Cliente> clientes) {
        super(entity);
        this.clientes = new HashSet<>();
        clientes.forEach(cliente -> this.clientes.add(new ClienteDTO(cliente)));
    }
}
