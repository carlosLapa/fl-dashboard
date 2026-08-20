package com.fl.dashboard.schedulers;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.services.TarefaService;
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
public class TarefaRecorrenciaScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TarefaRecorrenciaScheduler.class);

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private TarefaService tarefaService;

    // Runs before DeadlineNotificationScheduler's 9:00 job so a freshly generated occurrence is
    // already in place by the time deadline warnings are computed for the day.
    @Scheduled(cron = "0 0 6 * * *")
    public void gerarOcorrenciasRecorrentes() {
        Date today = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        List<Tarefa> templatesDue = tarefaRepository.findRecorrentesDue(today);
        logger.info("Verificação de tarefas recorrentes: {} template(s) com ocorrência em falta", templatesDue.size());

        int generated = 0;
        for (Tarefa template : templatesDue) {
            try {
                tarefaService.gerarOcorrenciaRecorrente(template);
                generated++;
            } catch (Exception e) {
                logger.error("Falha ao gerar ocorrência recorrente para a tarefa template ID={}: {}",
                        template.getId(), e.getMessage(), e);
            }
        }
        logger.info("Verificação de tarefas recorrentes concluída: {} nova(s) tarefa(s) gerada(s)", generated);
    }
}