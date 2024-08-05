package com.fl.dashboard.entities;

import com.fl.dashboard.enums.TarefaStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_coluna")
@Getter
@Setter
public class Coluna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private TarefaStatus status;

    private String titulo;
    private Integer ordem;

    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @OneToMany(mappedBy = "coluna")
    private Set<Tarefa> tarefas = new HashSet<>();

    public Coluna() {
    }

    public Coluna(Long id, TarefaStatus status, String titulo, Integer ordem) {
        this.id = id;
        this.status = status;
        this.titulo = titulo;
        this.ordem = ordem;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Coluna coluna = (Coluna) o;
        return Objects.equals(id, coluna.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}



