package com.fl.dashboard.dto;

import com.fl.dashboard.enums.TarefaStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ColunaWithProjetoDTO {

    private Long id;
    private TarefaStatus status;
    private String titulo;
    private Integer ordem;
    private Long projetoId;
}
