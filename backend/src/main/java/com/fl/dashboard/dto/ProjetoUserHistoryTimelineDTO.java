package com.fl.dashboard.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ProjetoUserHistoryTimelineDTO {

    private Long userId;
    private List<ProjetoUserHistoryEventDTO> eventos;
    private List<MonthlyProjectCountDTO> projetosAtivosPorMes;
    private List<ProjetoTimeSpentDTO> tempoPorProjeto;

    public ProjetoUserHistoryTimelineDTO(
            Long userId,
            List<ProjetoUserHistoryEventDTO> eventos,
            List<MonthlyProjectCountDTO> projetosAtivosPorMes,
            List<ProjetoTimeSpentDTO> tempoPorProjeto) {
        this.userId = userId;
        this.eventos = eventos;
        this.projetosAtivosPorMes = projetosAtivosPorMes;
        this.tempoPorProjeto = tempoPorProjeto;
    }
}
