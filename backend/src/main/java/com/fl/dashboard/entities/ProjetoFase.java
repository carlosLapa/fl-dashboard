package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Objects;

// A phase of a projeto (e.g. "Design Freeze", "Civil Works — Phase 1"), shown as one row of the
// projeto's Gantt timeline. Tarefas point to it through Tarefa.fase; the projeto side has no
// collection mapping on purpose, phases are always loaded through ProjetoFaseRepository.
@Entity
@Table(name = "tb_projeto_fase")
@Getter
@Setter
public class ProjetoFase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @Column(nullable = false, length = 100)
    private String nome;

    private String descricao;

    // Planned dates, both optional and inclusive: a phase may be created before its dates are known.
    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(nullable = false)
    private Integer ordem = 0;

    public ProjetoFase() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjetoFase that = (ProjetoFase) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
