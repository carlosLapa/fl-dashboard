package com.fl.dashboard.dto;

import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;

/**
 * Lightweight user representation for embedding inside other DTOs
 * (e.g. Tarefa/Projeto). Deliberately omits password and profileImage,
 * which are only needed by the dedicated /users endpoints.
 */
@Getter
@Setter
public class UserSummaryDTO {

    private Long id;
    private String name;
    private String funcao;
    private String cargo;
    private String email;

    public UserSummaryDTO() {
    }

    public UserSummaryDTO(User entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.funcao = entity.getFuncao();
        this.cargo = entity.getCargo();
        this.email = entity.getEmail();
    }
}