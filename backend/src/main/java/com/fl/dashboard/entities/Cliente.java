package com.fl.dashboard.entities;

import com.fl.dashboard.converters.JsonListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "tb_cliente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String morada;
    private String nif;

    // New collection fields using JPA converters
    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "json")
    private List<String> contactos = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "json")
    private List<String> responsaveis = new ArrayList<>();

    @Convert(converter = JsonListConverter.class)
    @Column(columnDefinition = "json")
    private List<String> emails = new ArrayList<>();

    // Add this field for soft deletion
    private Timestamp deletedAt;

    // Relationship with Projetos - One Cliente can have many Projetos
    @OneToMany(mappedBy = "cliente")
    private Set<Projeto> projetos = new HashSet<>();
}
