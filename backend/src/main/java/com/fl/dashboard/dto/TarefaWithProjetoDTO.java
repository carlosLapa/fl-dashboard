package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TarefaWithProjetoDTO extends TarefaDTO {

    private ProjetoDTO projeto;

    public TarefaWithProjetoDTO(Tarefa entity) {
        super(entity);
        this.projeto = new ProjetoDTO(entity.getProjeto());
    }

}
