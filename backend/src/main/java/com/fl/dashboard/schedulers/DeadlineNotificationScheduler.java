package com.fl.dashboard.schedulers;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Component
public class DeadlineNotificationScheduler {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(cron = "0 0 9 * * *") // Corre diariamente às 9:00
    public void checkDeadlines() {
        LocalDate warningDate = LocalDate.now().plusDays(3); // Aviso de 3 dias antes

        // Check Tarefas
        List<Tarefa> nearDeadlineTarefas = tarefaRepository.findByPrazoRealBeforeAndStatusNot(
                warningDate,
                TarefaStatus.DONE
        );

        nearDeadlineTarefas.forEach(tarefa -> {
            tarefa.getUsers().forEach(user -> {
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
                }
            });
        });

    }
}
