package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.enums.TipoProjeto;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class ProjetoDTO {

    private Long id;
    private Integer projetoAno;

    @Size(min = 4, max = 50, message = "Designação deve conter de 5 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String designacao;

    @Size(min = 4, max = 50, message = "Entidade deve conter de 4 a 50 caracteres")
    @NotBlank(message = "Campo requerido")
    private String entidade;

    private String prioridade;
    private String observacao;

    @FutureOrPresent(message = "Data deve ser no presente ou futuro")
    private Date prazo;

    private String status;

    private Long coordenadorId;
    private UserDTO coordenador;
    private Date dataProposta;
    private Date dataAdjudicacao;
    private TipoProjeto tipo;

    private Set<ExternoDTO> externos = new HashSet<>();
    private List<Long> externoIds = new ArrayList<>();

    public ProjetoDTO() {
    }

    public ProjetoDTO(Long id, Integer projetoAno, String designacao, String entidade, String prioridade, String observacao, Date prazo, String status) {
        this.id = id;
        this.projetoAno = projetoAno;
        this.designacao = designacao;
        this.entidade = entidade;
        this.prioridade = prioridade;
        this.observacao = observacao;
        this.prazo = prazo;
        this.status = status;
    }

    public ProjetoDTO(Projeto entity) {
        this.id = entity.getId();
        this.projetoAno = entity.getProjetoAno();
        this.designacao = entity.getDesignacao();
        this.entidade = entity.getEntidade();
        this.prioridade = entity.getPrioridade();
        this.observacao = entity.getObservacao();
        this.prazo = entity.getPrazo();
        this.status = entity.getStatus();
        this.tipo = entity.getTipo();

        if (entity.getCoordenador() != null) {
            this.coordenador = new UserDTO(entity.getCoordenador());
            this.coordenadorId = entity.getCoordenador().getId();
        }

        this.dataProposta = entity.getDataProposta();
        this.dataAdjudicacao = entity.getDataAdjudicacao();

        // Preencher os externoDTOs e externoIds a partir da entidade
        if (entity.getExternos() != null) {
            entity.getExternos().forEach(externo -> {
                this.externos.add(new ExternoDTO(externo));
                this.externoIds.add(externo.getId());
            });
        }
    }

    public ProjetoDTO(Long id, String designacao) {
        this.id = id;
        this.designacao = designacao;
    }
}