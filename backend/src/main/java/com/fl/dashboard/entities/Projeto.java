package com.fl.dashboard.entities;

import jakarta.persistence.*;

import java.util.*;

@Entity
@Table(name = "tb_projeto")
public class Projeto {

    @ManyToMany
    @JoinTable(name = "tb_projeto_user",
            joinColumns = @JoinColumn(name = "projeto_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "projeto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<Coluna> colunas = new ArrayList<>();

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

    @OneToMany(mappedBy = "projeto", fetch = FetchType.LAZY)
    private Set<Tarefa> tarefas = new HashSet<>();

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

    public Set<User> getUsers() {
        return users;
    }

    public Set<Tarefa> getTarefas() {
        return tarefas;
    }

    public void setTarefas(Set<Tarefa> tarefas) {
        this.tarefas = tarefas;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getProjetoAno() {
        return projetoAno;
    }

    public void setProjetoAno(Integer projetoAno) {
        this.projetoAno = projetoAno;
    }

    public String getDesignacao() {
        return designacao;
    }

    public void setDesignacao(String designacao) {
        this.designacao = designacao;
    }

    public String getEntidade() {
        return entidade;
    }

    public void setEntidade(String entidade) {
        this.entidade = entidade;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public Date getPrazo() {
        return prazo;
    }

    public void setPrazo(Date prazo) {
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
