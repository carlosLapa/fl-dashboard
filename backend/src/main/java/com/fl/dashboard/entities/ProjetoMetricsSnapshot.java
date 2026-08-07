package com.fl.dashboard.entities;

import com.fl.dashboard.enums.SnapshotTriggerType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "tb_projeto_metrics_snapshot")
@Getter
@Setter
public class ProjetoMetricsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "total_tarefas", nullable = false)
    private Integer totalTarefas;

    @Column(name = "tarefas_concluidas", nullable = false)
    private Integer tarefasConcluidas;

    @Column(name = "tarefas_em_progresso", nullable = false)
    private Integer tarefasEmProgresso;

    @Column(name = "tarefas_pendentes", nullable = false)
    private Integer tarefasPendentes;

    @Column(name = "tempo_medio_dias")
    private Double tempoMedioDias;

    @Column(name = "taxa_conclusao")
    private Double taxaConclusao;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false, length = 20)
    private SnapshotTriggerType triggerType;

    @ManyToOne
    @JoinColumn(name = "triggered_by_user_id")
    private User triggeredByUser;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public ProjetoMetricsSnapshot() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjetoMetricsSnapshot that = (ProjetoMetricsSnapshot) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
