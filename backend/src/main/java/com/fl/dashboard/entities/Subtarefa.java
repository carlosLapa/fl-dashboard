package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "tb_subtarefa")
@Getter
@Setter
public class Subtarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tarefa_id")
    private Tarefa tarefa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    private String descricao;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percentual;

    @Column(nullable = false)
    private boolean concluida = false;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Subtarefa() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Subtarefa subtarefa = (Subtarefa) o;
        return Objects.equals(id, subtarefa.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
