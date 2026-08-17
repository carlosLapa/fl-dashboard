package com.fl.dashboard.schedulers;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

@Component
public class DeadlineNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DeadlineNotificationScheduler.class);
    private static final String PROJETO_STATUS_CONCLUIDO = "CONCLUIDO";

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * *") // Corre diariamente às 9:00
    public void checkDeadlines() {
        LocalDate warningDate = LocalDate.now().plusDays(3); // Aviso de 3 dias antes
        // Tarefa.prazoReal / Projeto.prazo are java.util.Date (Timestamp) columns — Hibernate
        // can't coerce a LocalDate query parameter against them, so convert once up front.
        Date warningDateAsDate = Date.from(warningDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
        logger.info("Running deadline notification check, warning threshold: {}", warningDate);

        int tarefaNotificationsSent = checkTarefaDeadlines(warningDateAsDate);
        int projetoNotificationsSent = checkProjetoDeadlines(warningDateAsDate);

        logger.info("Deadline notification check finished: {} tarefa notification(s), {} projeto notification(s)",
                tarefaNotificationsSent, projetoNotificationsSent);
    }

    private int checkTarefaDeadlines(Date warningDate) {
        List<Tarefa> nearDeadlineTarefas = tarefaRepository.findByPrazoRealBeforeAndStatusNot(
                warningDate,
                TarefaStatus.DONE
        );

        int[] sent = {0};
        nearDeadlineTarefas.forEach(tarefa -> tarefa.getUsers().forEach(user -> {
            if (!notificationService.existsDeadlineNotification(tarefa.getId(), user.getId(), tarefa.getPrazoReal())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.TAREFA_PRAZO_PROXIMO.name())
                        .content(buildDeadlineMessage("A tarefa", tarefa.getDescricao(), tarefa.getPrazoReal()))
                        .userId(user.getId())
                        .tarefaId(tarefa.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .notifiedDeadline(tarefa.getPrazoReal())
                        .build();

                notificationService.processNotification(notification);
                sent[0]++;
            }
        }));
        return sent[0];
    }

    private int checkProjetoDeadlines(Date warningDate) {
        List<Projeto> nearDeadlineProjetos = projetoRepository.findByPrazoBeforeAndStatusNot(
                warningDate,
                PROJETO_STATUS_CONCLUIDO
        );

        int[] sent = {0};
        nearDeadlineProjetos.forEach(projeto -> projeto.getUsers().forEach(user -> {
            if (!notificationService.existsProjetoDeadlineNotification(projeto.getId(), user.getId(), projeto.getPrazo())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.PROJETO_PRAZO_PROXIMO.name())
                        .content(buildDeadlineMessage("O projeto", projeto.getDesignacao(), projeto.getPrazo()))
                        .userId(user.getId())
                        .projetoId(projeto.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .notifiedDeadline(projeto.getPrazo())
                        .build();

                notificationService.processNotification(notification);
                sent[0]++;
            }
        }));
        return sent[0];
    }

    // "A tarefa"/"O projeto" + nome, phrased differently depending on whether the deadline is
    // still ahead or already passed — the old fixed "tem prazo próximo" wording was misleading
    // for items overdue by weeks, since the query intentionally also catches those (see
    // findByPrazoRealBeforeAndStatusNot/findByPrazoBeforeAndStatusNot: "< warningDate", not a
    // lower-bounded window), so they keep getting surfaced instead of going silent once missed.
    private String buildDeadlineMessage(String prefix, String nome, Date prazo) {
        LocalDate prazoLocalDate = prazo.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), prazoLocalDate);
        String dataFormatada = new SimpleDateFormat("dd/MM/yyyy").format(prazo);

        String situacao;
        if (daysUntil > 0) {
            situacao = "tem prazo dentro de " + daysUntil + " dia(s)";
        } else if (daysUntil == 0) {
            situacao = "tem prazo hoje";
        } else {
            situacao = "ultrapassou o prazo há " + Math.abs(daysUntil) + " dia(s)";
        }

        return prefix + " '" + nome + "' " + situacao + " (" + dataFormatada + ")";
    }
}
