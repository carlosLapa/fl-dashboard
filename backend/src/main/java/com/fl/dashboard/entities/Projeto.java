package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_projeto")
@Getter
@Setter
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer projetoAno;
    private String designacao;
    private String entidade;
    // private String especialidade; Lista da entidade Especialidade
    //private String coordenacao - buscar o nome ao User
    //private String responsavel - buscar o nome ao User
    private String prioridade;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Date prazo;

    @ManyToMany
    @JoinTable(name="tb_projeto_user",
            joinColumns = @JoinColumn(name = "projeto_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    Set<User> users = new HashSet<>();

    public Projeto() {
    }

    public Projeto(Long id, Integer projetoAno, String designacao, String entidade, String prioridade, String observacao, Date prazo) {
        this.id = id;
        this.projetoAno = projetoAno;
        this.designacao = designacao;
        this.entidade = entidade;
        this.prioridade = prioridade;
        this.observacao = observacao;
        this.prazo = prazo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Projeto projeto = (Projeto) o;
        return Objects.equals(id, projeto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
