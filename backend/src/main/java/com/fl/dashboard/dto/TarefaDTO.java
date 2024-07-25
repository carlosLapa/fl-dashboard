package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@ToString
public class TarefaDTO {

    private Long id;
    private String descricao;
    private String status;
    private String prioridade;
    private Date prazoEstimado;
    private Date prazoReal;

    private Set<UserDTO> users = new HashSet<>();

    public TarefaDTO() {
    }

    public TarefaDTO(Long id, String descricao, String status, String prioridade, Date prazoEstimado, Date prazoReal) {
        this.id = id;
        this.descricao = descricao;
        this.status = status;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
    }

    public TarefaDTO(Tarefa entity) {
        this.id = entity.getId();
        this.descricao = entity.getDescricao();
        this.status = entity.getStatus();
        this.prioridade = entity.getPrioridade();
        this.prazoEstimado = entity.getPrazoEstimado();
        this.prazoReal = entity.getPrazoReal();
        this.users = entity.getUsers().stream().map(UserDTO::new).collect(Collectors.toSet());
    }

    public TarefaDTO(Tarefa entity, Set<User> users) {
        this(entity);
        users.forEach(u -> this.users.add(new UserDTO(u)));
    }


}
