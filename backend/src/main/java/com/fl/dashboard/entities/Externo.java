package com.fl.dashboard.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fl.dashboard.enums.EspecialidadesExterno;
import com.fl.dashboard.enums.FaseProjeto;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tb_externo")
@Getter
@Setter
public class Externo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String telemovel;

    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(name = "fase_projeto")
    private FaseProjeto faseProjeto;

    @Column(name = "deleted_at")
    private Timestamp deletedAt;

    @ElementCollection(targetClass = EspecialidadesExterno.class)
    @CollectionTable(
            name = "tb_externo_especialidades",
            joinColumns = @JoinColumn(name = "externo_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "especialidade")
    private Set<EspecialidadesExterno> especialidades = new HashSet<>();

    @JsonBackReference
    @ManyToMany
    @JoinTable(
            name = "tb_projeto_externo",
            joinColumns = @JoinColumn(name = "externo_id"),
            inverseJoinColumns = @JoinColumn(name = "projeto_id")
    )
    private Set<Projeto> projetos = new HashSet<>();

    @JsonBackReference
    @ManyToMany
    @JoinTable(
            name = "tb_tarefa_externo",
            joinColumns = @JoinColumn(name = "externo_id"),
            inverseJoinColumns = @JoinColumn(name = "tarefa_id")
    )
    private Set<Tarefa> tarefas = new HashSet<>();
}
