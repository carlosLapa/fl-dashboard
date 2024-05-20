package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@ToString
public class ProjetoDTO {

    private Long id;
    private Integer projetoAno;
    private String designacao;
    private String entidade;
    private String prioridade;
    private String observacao;
    private Date prazo;

    public ProjetoDTO() {
    }

    public ProjetoDTO(Long id, Integer projetoAno, String designacao, String entidade, String prioridade, String observacao, Date prazo) {
        this.id = id;
        this.projetoAno = projetoAno;
        this.designacao = designacao;
        this.entidade = entidade;
        this.prioridade = prioridade;
        this.observacao = observacao;
        this.prazo = prazo;
    }

    public ProjetoDTO(Projeto entity){
        id = entity.getId();
        projetoAno = entity.getProjetoAno();
        designacao = entity.getDesignacao();
        entidade = entity.getEntidade();
        prioridade = entity.getPrioridade();
        observacao = entity.getObservacao();
        prazo = entity.getPrazo();
    }
}
