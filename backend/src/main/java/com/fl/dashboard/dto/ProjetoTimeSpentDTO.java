package com.fl.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Total time a collaborator has spent assigned to a project, derived from
 * pairing up ADDED/REMOVED events for that (projeto, user) pair. If the
 * collaborator is still on the project, "ativo" is true and totalDias counts
 * up to now.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjetoTimeSpentDTO {

    private Long projetoId;
    private String projetoDesignacao;
    private Double totalDias;
    private boolean ativo;
}
