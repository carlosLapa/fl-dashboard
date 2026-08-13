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

import java.time.LocalDate;
import java.time.ZoneId;
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
            if (!notificationService.existsDeadlineNotification(tarefa.getId(), user.getId())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.TAREFA_PRAZO_PROXIMO.name())
                        .content("A tarefa '" + tarefa.getDescricao() + "' tem prazo próximo: "
                                + tarefa.getPrazoReal())
                        .userId(user.getId())
                        .tarefaId(tarefa.getId())
                        .isRead(false)
                        .createdAt(new Date())
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
            if (!notificationService.existsProjetoDeadlineNotification(projeto.getId(), user.getId())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.PROJETO_PRAZO_PROXIMO.name())
                        .content("O projeto '" + projeto.getDesignacao() + "' tem prazo próximo: "
                                + projeto.getPrazo())
                        .userId(user.getId())
                        .projetoId(projeto.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .build();

                notificationService.processNotification(notification);
                sent[0]++;
            }
        }));
        return sent[0];
    }
}
