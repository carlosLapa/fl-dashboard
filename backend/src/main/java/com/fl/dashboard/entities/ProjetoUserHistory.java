package com.fl.dashboard.entities;

import com.fl.dashboard.enums.ProjetoUserHistoryAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Audit trail of when a User was added to or removed from a Projeto.
 * tb_projeto_user (the M2M join table) has no dates, so this is the only
 * place assignment history is recorded - and only from the point this
 * feature was deployed onward.
 */
@Entity
@Table(name = "tb_projeto_user_history")
@Getter
@Setter
public class ProjetoUserHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ProjetoUserHistoryAction action;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    public ProjetoUserHistory() {
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProjetoUserHistory that = (ProjetoUserHistory) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
