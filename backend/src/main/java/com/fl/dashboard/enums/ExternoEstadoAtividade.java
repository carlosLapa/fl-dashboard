package com.fl.dashboard.enums;

/**
 * Derived (not persisted) activity status of an Externo, based on the Projetos it is assigned to.
 */
public enum ExternoEstadoAtividade {
    // Assigned to at least one non-archived Projeto that is ATIVO or EM_PROGRESSO
    ATIVO,
    // Has Projetos, but none of them currently active (concluded, suspended or archived)
    INATIVO,
    // Never assigned to any (non-deleted) Projeto
    SEM_PROJETOS
}
