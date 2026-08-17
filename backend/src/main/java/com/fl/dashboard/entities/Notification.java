package com.fl.dashboard.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "tb_notification")
@Getter
@Setter
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String content;
    private Boolean isRead;
    private Date createdAt;
    private Long relatedId;
    // The Tarefa.prazoReal / Projeto.prazo value that was active when a deadline-warning
    // notification (TAREFA_PRAZO_PROXIMO / PROJETO_PRAZO_PROXIMO) was created — lets the
    // scheduler tell "already warned about this exact deadline" apart from "deadline was
    // since postponed and is approaching again", instead of suppressing forever per type.
    private Date notifiedDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_id")
    private Tarefa tarefa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id")
    private Projeto projeto;

}
