package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


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

    public Tarefa() {
    }

    public Tarefa(Long id, String descricao, String prioridade) {
        this.id = id;
        this.descricao = descricao;
        this.prioridade = prioridade;
    }
}
