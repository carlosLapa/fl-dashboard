package com.fl.dashboard.entities;

import com.fl.dashboard.converters.JsonListConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.sql.Timestamp;
import java.util.*;

@Entity
@Table(name = "tb_cliente")
@Getter
@Setter
@ToString
@RequiredArgsConstructor
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
    @ToString.Exclude
    private Set<Projeto> projetos = new HashSet<>();

    @ManyToMany(mappedBy = "clientes")
    @ToString.Exclude
    private Set<Proposta> propostas = new HashSet<>();

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cliente cliente)) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        return getId() != null && Objects.equals(getId(), cliente.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy hibernateProxy
                ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}
