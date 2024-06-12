package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;
import java.util.Objects;

@Entity
@Table(name = "tb_tarefa")
@Getter
@Setter
@ToString
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String descricao;
    private String prioridade; //ENUMS??
    private Date prazoEstimado;
    private Date prazoReal;

    public Tarefa() {
    }

    public Tarefa(Long id, String descricao, String prioridade, Date prazoEstimado, Date prazoReal) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazoEstimado = prazoEstimado;
        this.prazoReal = prazoReal;
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
