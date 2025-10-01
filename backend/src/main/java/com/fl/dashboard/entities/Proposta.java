package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.proxy.HibernateProxy;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "tb_proposta")
@Getter
@Setter
@NoArgsConstructor
public class Proposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer propostaAno;
    private String designacao;
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

    @Column(name = "tipo")
    private String tipo;

    @ManyToMany
    @JoinTable(name = "tb_proposta_cliente",
            joinColumns = @JoinColumn(name = "proposta_id"),
            inverseJoinColumns = @JoinColumn(name = "cliente_id"))
    private Set<Cliente> clientes = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Proposta proposta)) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        return getId() != null && Objects.equals(getId(), proposta.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy hibernateProxy
                ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass().hashCode()
                : getClass().hashCode();
    }
}