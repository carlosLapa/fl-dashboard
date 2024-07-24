package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;
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

    private List<UserDTO> assignedUsers;
    private ProjetoDTO projeto;

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
        id = entity.getId();
        descricao = entity.getDescricao();
        status = entity.getStatus();
        prioridade = entity.getPrioridade();
        prazoEstimado = entity.getPrazoEstimado();
        prazoReal = entity.getPrazoReal();
        assignedUsers = entity.getAssignedUsers().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
        projeto = new ProjetoDTO(entity.getProjeto());
    }

    public TarefaDTO(Tarefa entity, Set<User> assignedUsers, Projeto projeto) {
        this(entity);
        List<UserDTO> list = new ArrayList<>();
        for (User assignedUser : assignedUsers) {
            UserDTO userDTO = new UserDTO(assignedUser);
            list.add(userDTO);
        }
        this.assignedUsers = list;
        this.projeto = new ProjetoDTO(projeto);
    }

}
