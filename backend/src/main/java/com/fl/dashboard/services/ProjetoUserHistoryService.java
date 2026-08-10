package com.fl.dashboard.services;

import com.fl.dashboard.dto.MonthlyProjectCountDTO;
import com.fl.dashboard.dto.ProjetoTimeSpentDTO;
import com.fl.dashboard.dto.ProjetoUserHistoryEventDTO;
import com.fl.dashboard.dto.ProjetoUserHistoryTimelineDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.ProjetoUserHistory;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.ProjetoUserHistoryAction;
import com.fl.dashboard.repositories.ProjetoUserHistoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Records and reads the ProjetoUserHistory audit trail (when a User was
 * added to/removed from a Projeto). Called from ProjetoService whenever
 * project membership actually changes - never reconstructs the past.
 */
@Service
public class ProjetoUserHistoryService {

    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ProjetoUserHistoryRepository projetoUserHistoryRepository;

    public ProjetoUserHistoryService(ProjetoUserHistoryRepository projetoUserHistoryRepository) {
        this.projetoUserHistoryRepository = projetoUserHistoryRepository;
    }

    @Transactional
    public void registarEvento(Projeto projeto, User user, ProjetoUserHistoryAction action) {
        ProjetoUserHistory evento = new ProjetoUserHistory();
        evento.setProjeto(projeto);
        evento.setUser(user);
        evento.setAction(action);
        evento.setEventDate(LocalDateTime.now());
        projetoUserHistoryRepository.save(evento);
    }

    @Transactional
    public void registarEventos(Projeto projeto, Collection<User> users, ProjetoUserHistoryAction action) {
        for (User user : users) {
            registarEvento(projeto, user, action);
        }
    }

    @Transactional(readOnly = true)
    public ProjetoUserHistoryTimelineDTO getHistoricoParaUser(Long userId) {
        List<ProjetoUserHistory> eventos = projetoUserHistoryRepository.findByUserIdOrderByEventDateAsc(userId);

        List<ProjetoUserHistoryEventDTO> eventosDTO = eventos.stream()
                .map(ProjetoUserHistoryEventDTO::new)
                .toList();

        return new ProjetoUserHistoryTimelineDTO(
                userId,
                eventosDTO,
                calculateMonthlyActiveProjects(eventos),
                calculateTimeSpentPerProject(eventos));
    }

    /**
     * Walks the (already chronologically sorted) events, keeping a running
     * ADDED/REMOVED tally, and keeps the last running value observed in each
     * calendar month - a simple step-chart aggregation, no separate
     * aggregate table needed.
     */
    private List<MonthlyProjectCountDTO> calculateMonthlyActiveProjects(List<ProjetoUserHistory> eventos) {
        Map<String, Integer> countByMonth = new LinkedHashMap<>();
        int running = 0;

        for (ProjetoUserHistory evento : eventos) {
            running += evento.getAction() == ProjetoUserHistoryAction.ADDED ? 1 : -1;
            String yearMonth = evento.getEventDate().format(YEAR_MONTH_FORMATTER);
            countByMonth.put(yearMonth, Math.max(running, 0));
        }

        return countByMonth.entrySet().stream()
                .map(entry -> new MonthlyProjectCountDTO(entry.getKey(), entry.getValue()))
                .toList();
    }

    /**
     * Pairs each ADDED event with the REMOVED that follows it (same
     * projeto), summing the elapsed time between them. A collaborator can
     * join/leave the same project more than once, so this sums every
     * ADDED-to-REMOVED cycle rather than just first-ADDED-to-last-REMOVED.
     * An ADDED with no matching REMOVED means the assignment is still
     * ongoing - counted up to now and flagged as active.
     */
    private List<ProjetoTimeSpentDTO> calculateTimeSpentPerProject(List<ProjetoUserHistory> eventos) {
        Map<Long, List<ProjetoUserHistory>> eventosPorProjeto = new LinkedHashMap<>();
        for (ProjetoUserHistory evento : eventos) {
            eventosPorProjeto
                    .computeIfAbsent(evento.getProjeto().getId(), k -> new ArrayList<>())
                    .add(evento);
        }

        List<ProjetoTimeSpentDTO> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (List<ProjetoUserHistory> projetoEventos : eventosPorProjeto.values()) {
            Duration total = Duration.ZERO;
            LocalDateTime pendingAdded = null;

            for (ProjetoUserHistory evento : projetoEventos) {
                if (evento.getAction() == ProjetoUserHistoryAction.ADDED) {
                    pendingAdded = evento.getEventDate();
                } else if (pendingAdded != null) {
                    total = total.plus(Duration.between(pendingAdded, evento.getEventDate()));
                    pendingAdded = null;
                }
            }

            boolean ativo = pendingAdded != null;
            if (ativo) {
                total = total.plus(Duration.between(pendingAdded, now));
            }

            Projeto projeto = projetoEventos.get(0).getProjeto();
            double totalDias = total.toMinutes() / (60.0 * 24);
            result.add(new ProjetoTimeSpentDTO(projeto.getId(), projeto.getDesignacao(), totalDias, ativo));
        }

        return result;
    }
}
