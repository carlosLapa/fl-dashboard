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

    // tb_notification.content is varchar(255), but messages embed tarefa descriptions and projeto
    // names that can themselves be up to 255 chars. An overlong value made the whole insert fail
    // (MysqlDataTruncation), which inside a tarefa save rolled the save back too, so cut it here.
    public static final int CONTENT_MAX_LENGTH = 255;

    public void setContent(String content) {
        if (content == null || content.length() <= CONTENT_MAX_LENGTH) {
            this.content = content;
            return;
        }
        int end = CONTENT_MAX_LENGTH - 1;
        // Don't split a surrogate pair (e.g. an emoji) in half.
        if (Character.isHighSurrogate(content.charAt(end - 1))) {
            end--;
        }
        this.content = content.substring(0, end) + "…";
    }

}
