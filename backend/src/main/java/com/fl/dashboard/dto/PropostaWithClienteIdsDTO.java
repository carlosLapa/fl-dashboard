package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Proposta;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class PropostaWithClienteIdsDTO extends PropostaDTO {

    private Set<Long> clienteIds = new HashSet<>();

    public PropostaWithClienteIdsDTO(Proposta entity) {
        super(entity);
        if (entity.getClientes() != null) {
            entity.getClientes().forEach(cliente -> this.clienteIds.add(cliente.getId()));
        }
    }
}
