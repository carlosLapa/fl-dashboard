package com.fl.dashboard.dto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SlackGroupedNotificationDTO {
    private String type;
    private String title;
    private TarefaWithUsersDTO tarefa;
    private Set<UserDTO> additionalUsers = new HashSet<>();
    private String additionalContent;

    public SlackGroupedNotificationDTO(String type, String title, TarefaWithUsersDTO tarefa) {
        this.type = type;
        this.title = title;
        this.tarefa = tarefa;
    }

    public void addUser(UserDTO user) {
        if (user != null) {
            this.additionalUsers.add(user);
        }
    }

    public void addUsers(List<UserDTO> users) {
        if (users != null) {
            this.additionalUsers.addAll(users);
        }
    }

    // Método helper para obter todos os users (da tarefa + adicionais)
    public List<UserDTO> getAllUsers() {
        Set<UserDTO> allUsers = new HashSet<>(tarefa.getUsers());
        allUsers.addAll(additionalUsers);
        return new ArrayList<>(allUsers);
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public TarefaWithUsersDTO getTarefa() {
        return tarefa;
    }

    public Set<UserDTO> getUsers() {
        return tarefa.getUsers();
    }

    public String getAdditionalContent() {
        return additionalContent;
    }

    public void setAdditionalContent(String additionalContent) {
        this.additionalContent = additionalContent;
    }
}