package com.fl.dashboard.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fl.dashboard.enums.TarefaStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "tb_tarefa")
@Getter
@Setter
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descricao;
    private String prioridade;
    private Date prazoEstimado;
    private Date prazoReal;

    @Column(name = "working_days")
    private Integer workingDays;

    @Enumerated(EnumType.STRING)
    private TarefaStatus status = TarefaStatus.BACKLOG;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "coluna_id")
    private Coluna coluna;

    @ManyToMany
    @JoinTable(name = "tb_tarefa_user",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonBackReference("user-tarefa")  // Changed to match the reference name
    Set<User> users = new HashSet<>();

    @JsonBackReference
    @ManyToMany(mappedBy = "tarefas")
    private Set<Externo> externos = new HashSet<>();

    @JsonBackReference
    @OneToMany(mappedBy = "tarefa")
    private List<Notification> notifications = new ArrayList<>();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public Tarefa() {
    }

    // Kept the existing constructor for backward compatibility
    public Tarefa(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
    }

    // Added a new constructor with workingDays - since V2 migration
    public Tarefa(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal, Integer workingDays) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
        this.workingDays = workingDays;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tarefa tarefa = (Tarefa) o;
        return Objects.equals(id, tarefa.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
