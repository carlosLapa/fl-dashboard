package com.fl.dashboard.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "tb_projeto")
public class Projeto {

    @JsonBackReference
    @ManyToMany
    @JoinTable(name = "tb_projeto_user",
            joinColumns = @JoinColumn(name = "projeto_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    Set<User> users = new HashSet<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "projeto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<Coluna> colunas = new ArrayList<>();

    @JsonBackReference
    @OneToMany(mappedBy = "projeto")
    private List<Notification> notifications = new ArrayList<>();

    @JsonBackReference
    @OneToMany(mappedBy = "projeto", fetch = FetchType.LAZY)
    private Set<Tarefa> tarefas = new HashSet<>();

    @JsonBackReference
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "tb_projeto_externo",
            joinColumns = @JoinColumn(name = "projeto_id"),
            inverseJoinColumns = @JoinColumn(name = "externo_id")
    )
    private Set<Externo> externos = new HashSet<>();

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "coordenador_id")
    private User coordenador;

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
    @Column
    private String status;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Date dataProposta;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Date dataAdjudicacao;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

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

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getCoordenador() {
        return coordenador;
    }

    public void setCoordenador(User coordenador) {
        this.coordenador = coordenador;
    }

    public Date getDataProposta() {
        return dataProposta;
    }

    public void setDataProposta(Date dataProposta) {
        this.dataProposta = dataProposta;
    }

    public Date getDataAdjudicacao() {
        return dataAdjudicacao;
    }

    public void setDataAdjudicacao(Date dataAdjudicacao) {
        this.dataAdjudicacao = dataAdjudicacao;
    }

    public Set<Externo> getExternos() {
        return externos;
    }

    public void setExternos(Set<Externo> externos) {
        this.externos = externos;
    }

    public List<Coluna> getColunas() {
        return colunas;
    }

    public void setColunas(List<Coluna> colunas) {
        this.colunas = colunas;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
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
