package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Proposta;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
public class PropostaDTO {

    private Long id;
    private Integer propostaAno;
    private String designacao;
    private String prioridade;
    private String observacao;
    private Date prazo;
    private String status;
    private Date dataProposta;
    private Date dataAdjudicacao;
    private String tipo;

    private Set<Long> clienteIds = new HashSet<>();
    private Set<ClienteDTO> clientes = new HashSet<>();

    public PropostaDTO(Proposta entity) {
        this.id = entity.getId();
        this.propostaAno = entity.getPropostaAno();
        this.designacao = entity.getDesignacao();
        this.prioridade = entity.getPrioridade();
        this.observacao = entity.getObservacao();
        this.prazo = entity.getPrazo();
        this.status = entity.getStatus();
        this.dataProposta = entity.getDataProposta();
        this.dataAdjudicacao = entity.getDataAdjudicacao();
        this.tipo = entity.getTipo();

        if (entity.getClientes() != null) {
            entity.getClientes().forEach(cliente -> {
                this.clientes.add(new ClienteDTO(cliente));
                this.clienteIds.add(cliente.getId());
            });
        }
    }
}
