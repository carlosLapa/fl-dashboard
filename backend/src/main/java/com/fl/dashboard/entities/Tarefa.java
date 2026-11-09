package com.fl.dashboard.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fl.dashboard.enums.FrequenciaRecorrencia;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.utils.DiasUteis;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

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

    @Version
    private Long version;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "coluna_id")
    private Coluna coluna;

    // Optional phase of the projeto's timeline. Must belong to the same projeto (checked in
    // ProjetoFaseService.resolverFaseParaTarefa). Lazy: DTOs only read its id, which needs no query.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fase_id")
    private ProjetoFase fase;

    @ManyToMany
    @JoinTable(name = "tb_tarefa_user",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonBackReference("user-tarefa")  // Changed to match the reference name
    Set<User> users = new HashSet<>();

    // BatchSize turns "1 lazy-load query per Tarefa in the result" (e.g. TarefaWithUserAndProjetoDTO
    // list endpoints mapping each task's externos individually) into one batched
    // "WHERE tarefa_id IN (...)" query per page/list, without joining externos into the main query.
    @JsonBackReference
    @BatchSize(size = 25)
    @ManyToMany
    @JoinTable(
            name = "tb_tarefa_externo",
            joinColumns = @JoinColumn(name = "tarefa_id"),
            inverseJoinColumns = @JoinColumn(name = "externo_id")
    )
    private Set<Externo> externos = new HashSet<>();

    @JsonBackReference
    @OneToMany(mappedBy = "tarefa")
    private List<Notification> notifications = new ArrayList<>();

    @JsonBackReference
    @OneToMany(mappedBy = "tarefa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TarefaLink> links = new ArrayList<>();

    @JsonBackReference
    @BatchSize(size = 25)
    @OneToMany(mappedBy = "tarefa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequisicaoEquipamento> requisicoes = new ArrayList<>();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @Column(name = "arquivada_em")
    private LocalDateTime arquivadaEm;

    public void markAsArquivada() {
        this.arquivadaEm = LocalDateTime.now();
    }

    public void markAsDesarquivada() {
        this.arquivadaEm = null;
    }

    public boolean isArquivada() {
        return arquivadaEm != null;
    }

    // Working days planned when the tarefa first had both dates. Frozen afterwards, so a later
    // change to the dates shows up as deviation instead of silently rewriting the plan.
    @Column(name = "dias_estimados")
    private Integer diasEstimados;

    // When the tarefa last moved to DONE (whoever moved it, from any screen); null while not DONE.
    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    // When the tarefa last entered IN_REVIEW; null while it is not in review.
    @Column(name = "entrada_revisao")
    private LocalDateTime entradaRevisao;

    // Working days spent in IN_REVIEW, added up over every review round, so the time a finished
    // tarefa waits for (or is under) review is kept apart from the time spent doing it.
    @Column(name = "dias_em_revisao")
    private Integer diasEmRevisao = 0;

    // Times the tarefa left review without being approved (sent back to rework).
    @Column(name = "devolucoes")
    private Integer devolucoes = 0;

    // Status as loaded from the database, to detect transitions (into review, out of it, to DONE). Without it, editing a
    // tarefa that was already DONE before data_conclusao existed would stamp a fake completion date.
    @Transient
    @JsonIgnore
    @Setter(AccessLevel.NONE)
    @Getter(AccessLevel.NONE)
    private TarefaStatus statusCarregado;

    @PostLoad
    void lembrarStatusCarregado() {
        this.statusCarregado = this.status;
    }

    // Single place that records the deviation data, so every path that saves a tarefa (edit modal,
    // Kanban drag, recurrence scheduler) stays consistent.
    @PrePersist
    @PreUpdate
    void registarTempos() {
        LocalDateTime agora = LocalDateTime.now();
        if (diasEstimados == null && workingDays != null) {
            diasEstimados = workingDays;
        }
        if (statusCarregado == TarefaStatus.IN_REVIEW && status != TarefaStatus.IN_REVIEW) {
            if (entradaRevisao != null) {
                diasEmRevisao = (diasEmRevisao == null ? 0 : diasEmRevisao)
                        + DiasUteis.decorridos(entradaRevisao, agora);
            }
            entradaRevisao = null;
            if (status != TarefaStatus.DONE) {
                devolucoes = (devolucoes == null ? 0 : devolucoes) + 1;
            }
        }
        if (status == TarefaStatus.IN_REVIEW && statusCarregado != TarefaStatus.IN_REVIEW) {
            entradaRevisao = agora;
        }
        if (status == TarefaStatus.DONE) {
            if (statusCarregado != TarefaStatus.DONE && dataConclusao == null) {
                dataConclusao = agora;
            }
        } else {
            dataConclusao = null;
        }
        statusCarregado = status;
    }

    private Boolean recorrente = false;

    @Enumerated(EnumType.STRING)
    private FrequenciaRecorrencia frequenciaRecorrencia;

    private Date dataFimRecorrencia;

    private Date proximaOcorrencia;

    // Plain FK id (no JPA relation) — only used to trace/display "gerada a partir da tarefa #X";
    // a full self-referencing relation would force an extra join/lazy-load for every Tarefa fetch.
    @Column(name = "tarefa_origem_id")
    private Long tarefaOrigemId;

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
