package com.fl.dashboard.services;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.ChatEventType;
import com.fl.dashboard.enums.ProjetoStatus;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.events.ChatNotificationEvent;
import com.fl.dashboard.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Turns Tarefa/Projeto changes into {@link ChatNotificationEvent}s. Must be called from inside the
 * service transaction that made the change: it reads lazy associations to build the snapshot, and
 * the event is only delivered to chat listeners once that transaction commits.
 * <p>
 * Every method swallows its own failures — a chat notification must never break the save that
 * triggered it.
 */
@Component
public class ChatNotificationPublisher {

    private static final Logger logger = LoggerFactory.getLogger(ChatNotificationPublisher.class);

    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;

    public ChatNotificationPublisher(ApplicationEventPublisher eventPublisher, UserRepository userRepository) {
        this.eventPublisher = eventPublisher;
        this.userRepository = userRepository;
    }

    // --- Tarefa ---

    public void tarefaCriada(Tarefa tarefa) {
        publishTarefa(ChatEventType.TAREFA_CRIADA, tarefa, null);
    }

    public void tarefaRecorrenteCriada(Tarefa tarefa) {
        publishTarefa(ChatEventType.TAREFA_RECORRENTE_CRIADA, tarefa, null);
    }

    public void tarefaRemovida(Tarefa tarefa) {
        publishTarefa(ChatEventType.TAREFA_REMOVIDA, tarefa, null);
    }

    /**
     * One message per save, typed by the most significant change (prazo > collaborators > edit);
     * the lesser changes are still listed as fields. TAREFA_EDITADA is off by default because it
     * fires on every save, so anything worth announcing needs its own type here.
     *
     * @param prazoAnterior the tarefa's prazoReal before the change (the "Prazo" shown in messages)
     */
    public void tarefaAtualizada(Tarefa tarefa, Date prazoAnterior, Set<User> previousUsers) {
        try {
            Map<String, String> extra = new LinkedHashMap<>();
            boolean prazoAlterado = isPrazoAlterado(prazoAnterior, tarefa.getPrazoReal());
            if (prazoAlterado) {
                extra.put("Prazo", prazoTransition(prazoAnterior, tarefa.getPrazoReal()));
            }
            boolean colaboradoresAlterados = putUserChanges(extra, previousUsers, tarefa.getUsers());

            ChatEventType type;
            if (prazoAlterado) {
                type = isProrrogado(prazoAnterior, tarefa.getPrazoReal())
                        ? ChatEventType.TAREFA_PRAZO_PRORROGADO
                        : ChatEventType.TAREFA_PRAZO_ALTERADO;
            } else if (colaboradoresAlterados) {
                type = ChatEventType.TAREFA_COLABORADORES_ALTERADOS;
            } else {
                type = ChatEventType.TAREFA_EDITADA;
            }
            publishTarefa(type, tarefa, extra);
        } catch (Exception e) {
            logger.warn("Could not build chat notification for tarefa {}", tarefa.getId(), e);
        }
    }

    public void tarefaEstadoAlterado(Tarefa tarefa, TarefaStatus anterior) {
        if (anterior == tarefa.getStatus()) {
            return;
        }
        ChatEventType type = tarefa.getStatus() == TarefaStatus.DONE
                ? ChatEventType.TAREFA_CONCLUIDA
                : ChatEventType.TAREFA_STATUS_ALTERADO;
        Map<String, String> extra = new LinkedHashMap<>();
        extra.put("Estado", tarefaStatusLabel(anterior) + " → " + tarefaStatusLabel(tarefa.getStatus()));
        publishTarefa(type, tarefa, extra);
    }

    // --- Projeto ---

    public void projetoCriado(Projeto projeto) {
        publishProjeto(ChatEventType.PROJETO_CRIADO, projeto, null);
    }

    public void projetoRemovido(Projeto projeto) {
        publishProjeto(ChatEventType.PROJETO_REMOVIDO, projeto, null);
    }

    /**
     * One message per save, typed by the most significant change
     * (status > prazo > collaborators > edit); the lesser changes are still listed as fields.
     * Covers the edit modal, which can change the prazo without going through extendPrazo.
     */
    public void projetoAtualizado(Projeto projeto, ProjetoStatus statusAnterior, Date prazoAnterior,
                                  Set<User> previousUsers) {
        try {
            Map<String, String> extra = new LinkedHashMap<>();
            boolean statusAlterado = statusAnterior != projeto.getStatus();
            if (statusAlterado) {
                extra.put("Estado", projetoStatusLabel(statusAnterior) + " → " + projetoStatusLabel(projeto.getStatus()));
            }
            boolean prazoAlterado = isPrazoAlterado(prazoAnterior, projeto.getPrazo());
            if (prazoAlterado) {
                extra.put("Prazo", prazoTransition(prazoAnterior, projeto.getPrazo()));
            }
            boolean colaboradoresAlterados = putUserChanges(extra, previousUsers, projeto.getUsers());

            ChatEventType type;
            if (statusAlterado) {
                type = projeto.getStatus() == ProjetoStatus.CONCLUIDO
                        ? ChatEventType.PROJETO_CONCLUIDO
                        : ChatEventType.PROJETO_STATUS_ALTERADO;
            } else if (prazoAlterado) {
                type = isProrrogado(prazoAnterior, projeto.getPrazo())
                        ? ChatEventType.PROJETO_PRAZO_PRORROGADO
                        : ChatEventType.PROJETO_PRAZO_ALTERADO;
            } else if (colaboradoresAlterados) {
                type = ChatEventType.PROJETO_COLABORADORES_ALTERADOS;
            } else {
                type = ChatEventType.PROJETO_EDITADO;
            }
            publishProjeto(type, projeto, extra);
        } catch (Exception e) {
            logger.warn("Could not build chat notification for projeto {}", projeto.getId(), e);
        }
    }

    public void projetoPrazoProrrogado(Projeto projeto, Date prazoAnterior) {
        Map<String, String> extra = new LinkedHashMap<>();
        extra.put("Prazo", prazoTransition(prazoAnterior, projeto.getPrazo()));
        publishProjeto(ChatEventType.PROJETO_PRAZO_PRORROGADO, projeto, extra);
    }

    // --- Snapshot builders ---

    private void publishTarefa(ChatEventType type, Tarefa tarefa, Map<String, String> extra) {
        try {
            Projeto projeto = tarefa.getProjeto();
            Map<String, String> campos = new LinkedHashMap<>();
            if (projeto != null) {
                campos.put("Projeto", projeto.getDesignacao());
            }
            campos.put("Estado", tarefaStatusLabel(tarefa.getStatus()));
            if (tarefa.getPrazoReal() != null) {
                campos.put("Prazo", formatDate(tarefa.getPrazoReal()));
            }
            if (tarefa.getPrioridade() != null && !tarefa.getPrioridade().isBlank()) {
                campos.put("Prioridade", tarefa.getPrioridade());
            }
            campos.put("Colaboradores", userNames(tarefa.getUsers()));
            if (extra != null) {
                campos.putAll(extra);
            }

            String linkPath = null;
            if (type != ChatEventType.TAREFA_REMOVIDA) {
                linkPath = projeto != null ? "/projetos/" + projeto.getId() + "/full" : "/tarefas";
            }
            eventPublisher.publishEvent(new ChatNotificationEvent(
                    type, tarefa.getDescricao(), linkPath, campos, currentUserName()));
        } catch (Exception e) {
            logger.warn("Could not publish chat notification {} for tarefa {}", type, tarefa.getId(), e);
        }
    }

    private void publishProjeto(ChatEventType type, Projeto projeto, Map<String, String> extra) {
        try {
            Map<String, String> campos = new LinkedHashMap<>();
            campos.put("Estado", projetoStatusLabel(projeto.getStatus()));
            if (projeto.getPrazo() != null) {
                campos.put("Prazo", formatDate(projeto.getPrazo()));
            }
            if (projeto.getPrioridade() != null && !projeto.getPrioridade().isBlank()) {
                campos.put("Prioridade", projetoPrioridadeLabel(projeto.getPrioridade()));
            }
            if (projeto.getCoordenador() != null) {
                campos.put("Coordenador", projeto.getCoordenador().getName());
            }
            campos.put("Colaboradores", userNames(projeto.getUsers()));
            if (extra != null) {
                campos.putAll(extra);
            }

            String linkPath = type != ChatEventType.PROJETO_REMOVIDO
                    ? "/projetos/" + projeto.getId() + "/details"
                    : null;
            eventPublisher.publishEvent(new ChatNotificationEvent(
                    type, projeto.getDesignacao(), linkPath, campos, currentUserName()));
        } catch (Exception e) {
            logger.warn("Could not publish chat notification {} for projeto {}", type, projeto.getId(), e);
        }
    }

    /**
     * Adds "Adicionados"/"Removidos" entries when the user set changed; returns whether it did.
     */
    private boolean putUserChanges(Map<String, String> campos, Set<User> previous, Set<User> current) {
        Set<User> before = previous != null ? previous : Set.of();
        Set<User> after = current != null ? current : Set.of();

        Set<User> added = new HashSet<>(after);
        added.removeAll(before);
        Set<User> removed = new HashSet<>(before);
        removed.removeAll(after);

        if (!added.isEmpty()) {
            campos.put("Adicionados", userNames(added));
        }
        if (!removed.isEmpty()) {
            campos.put("Removidos", userNames(removed));
        }
        return !added.isEmpty() || !removed.isEmpty();
    }

    private String userNames(Collection<User> users) {
        if (users == null || users.isEmpty()) {
            return "—";
        }
        return users.stream()
                .map(User::getName)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.joining(", "));
    }

    /**
     * Name of the authenticated user, or null outside a request (e.g. the recurring-task scheduler).
     * Uses the JWT "email" claim, not the principal name (see the JWT sub=client_id note in CLAUDE.md).
     */
    private String currentUserName() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!(auth instanceof JwtAuthenticationToken jwtToken)) {
                return null;
            }
            String email = jwtToken.getToken().getClaimAsString("email");
            if (email == null) {
                return null;
            }
            User user = userRepository.findByEmail(email);
            return user != null ? user.getName() : null;
        } catch (Exception e) {
            logger.debug("Could not resolve current user for chat notification", e);
            return null;
        }
    }

    private static String formatDate(Date date) {
        return date != null ? new SimpleDateFormat("dd/MM/yyyy").format(date) : "—";
    }

    // Compared by calendar day: the stored value (java.sql.Timestamp) and the incoming one
    // (java.util.Date, possibly with a different time-of-day) are not reliably equals().
    private static boolean isPrazoAlterado(Date anterior, Date novo) {
        return !formatDate(anterior).equals(formatDate(novo));
    }

    // Setting a prazo where there was none counts as an extension; removing one does not.
    private static boolean isProrrogado(Date anterior, Date novo) {
        return anterior == null || (novo != null && novo.getTime() > anterior.getTime());
    }

    private static String prazoTransition(Date anterior, Date novo) {
        return (anterior != null ? formatDate(anterior) : "sem prazo")
                + " → " + (novo != null ? formatDate(novo) : "sem prazo");
    }

    // Projeto stores prioridade as an uppercase code (unlike Tarefa, which stores the label);
    // mirrors ProjetoPrioridadeBadge in the frontend.
    static String projetoPrioridadeLabel(String prioridade) {
        return switch (prioridade) {
            case "URGENTE" -> "Urgente";
            case "ALTA" -> "Alta";
            case "MEDIA" -> "Média";
            case "BAIXA" -> "Baixa";
            case "EM ESPERA" -> "Em Espera";
            default -> prioridade;
        };
    }

    // Mirrors the labels used in the frontend (TarefaList / constants/projetoStatus.ts).
    static String tarefaStatusLabel(TarefaStatus status) {
        if (status == null) {
            return "—";
        }
        return switch (status) {
            case BACKLOG -> "Backlog";
            case TODO -> "A Fazer";
            case IN_PROGRESS -> "Em Progresso";
            case IN_REVIEW -> "Em Revisão";
            case DONE -> "Concluído";
        };
    }

    static String projetoStatusLabel(ProjetoStatus status) {
        if (status == null) {
            return "—";
        }
        return switch (status) {
            case ATIVO -> "Ativo";
            case EM_PROGRESSO -> "Em Progresso";
            case CONCLUIDO -> "Concluído";
            case SUSPENSO -> "Suspenso";
        };
    }
}
