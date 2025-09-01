package com.fl.dashboard.dto;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class ProjetoWithUsersAndTarefasDTO extends ProjetoDTO {

    private Set<UserDTO> users = new HashSet<>();
    private Set<TarefaDTO> tarefas = new HashSet<>();
    private Set<ExternoDTO> externos = new HashSet<>();

    public ProjetoWithUsersAndTarefasDTO() {
        super();
    }

    public ProjetoWithUsersAndTarefasDTO(Projeto entity) {
        super(entity);
        Hibernate.initialize(entity.getUsers());
        Hibernate.initialize(entity.getTarefas());
        // Inicializar externos também
        Hibernate.initialize(entity.getExternos());

        // Inicializar users como conjunto vazio se for null
        if (entity.getUsers() != null) {
            this.users = entity.getUsers().stream()
                    .map(UserDTO::new)
                    .collect(Collectors.toSet());
        } else {
            this.users = new HashSet<>();
        }

        // Inicializar tarefas como conjunto vazio se for null
        // E filtrar tarefas apagadas
        if (entity.getTarefas() != null) {
            this.tarefas = entity.getTarefas().stream()
                    .filter(tarefa -> tarefa.getDeletedAt() == null)
                    .map(TarefaDTO::new)
                    .collect(Collectors.toSet());
        } else {
            this.tarefas = new HashSet<>();
        }

        // Inicializar externos como conjunto vazio se for null
        // E filtrar externos ativos
        if (entity.getExternos() != null) {
            this.externos = entity.getExternos().stream()
                    .filter(externo -> externo.getDeletedAt() == null)
                    .map(ExternoDTO::new)
                    .collect(Collectors.toSet());
        } else {
            this.externos = new HashSet<>();
        }
    }

    public ProjetoWithUsersAndTarefasDTO(Projeto entity, Set<User> users, Set<Tarefa> tarefas) {
        super(entity);
        this.users = users.stream().map(UserDTO::new).collect(Collectors.toSet());
        this.tarefas = tarefas.stream().map(TarefaDTO::new).collect(Collectors.toSet());

        // Adicionar mapeamento dos externos
        if (entity.getExternos() != null) {
            this.externos = entity.getExternos().stream()
                    .filter(externo -> externo.getDeletedAt() == null)
                    .map(ExternoDTO::new)
                    .collect(Collectors.toSet());
        }
    }
}