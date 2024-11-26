package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.EstadoTarefa;
import com.fl.dashboard.repositories.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Service
@EnableScheduling
public class TaskDeadlineNotificationService {

    private final TarefaRepository tarefaRepository;
    private final NotificationService notificationService;

    @Autowired
    public TaskDeadlineNotificationService(TarefaRepository tarefaRepository, NotificationService notificationService) {
        this.tarefaRepository = tarefaRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 0 * * *") // Runs daily at midnight
    @Transactional
    public void checkTaskDeadlines() {
        LocalDate deadlineThreshold = LocalDate.now().plusDays(5);
        List<Tarefa> tasksNearingDeadline = tarefaRepository.findByPrazoRealBeforeAndStatusNot(deadlineThreshold, EstadoTarefa.DONE);

        for (Tarefa tarefa : tasksNearingDeadline) {
            NotificationInsertDTO notification = NotificationInsertDTO.builder()
                    .type("TASK_DEADLINE_APPROACHING")
                    .content("A tarefa '" + tarefa.getDescricao() + "' tem prazo até " + tarefa.getPrazoReal())
                    .isRead(false)
                    .createdAt(new Date())
                    .userId(tarefa.getUsers().iterator().next().getId())
                    .tarefaId(tarefa.getId())
                    .build();

            notificationService.insert(notification);
        }
    }
}





