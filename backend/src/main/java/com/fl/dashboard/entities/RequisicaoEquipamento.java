package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "tb_requisicao_equipamento")
@Getter
@Setter
public class RequisicaoEquipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tarefa_id")
    private Tarefa tarefa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipamento_id")
    private Equipamento equipamento;

    // Whole days, both inclusive: two requisições sharing a single day count as overlapping.
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    private String observacoes;

    public RequisicaoEquipamento() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RequisicaoEquipamento that = (RequisicaoEquipamento) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
