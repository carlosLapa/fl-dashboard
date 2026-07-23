package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.SubtarefaDTO;
import com.fl.dashboard.dto.SubtarefaDivisaoItemDTO;
import com.fl.dashboard.entities.Subtarefa;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.repositories.SubtarefaRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.fl.dashboard.services.exceptions.SubtarefaDivisaoInvalidaException;
import com.fl.dashboard.services.exceptions.SubtarefasIncompletasException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SubtarefaService {

    private final SubtarefaRepository subtarefaRepository;
    private final TarefaRepository tarefaRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SubtarefaService(SubtarefaRepository subtarefaRepository, TarefaRepository tarefaRepository,
                             UserRepository userRepository, NotificationService notificationService) {
        this.subtarefaRepository = subtarefaRepository;
        this.tarefaRepository = tarefaRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<SubtarefaDTO> findByTarefaId(Long tarefaId) {
        return subtarefaRepository.findByTarefaIdOrderByIdAsc(tarefaId).stream()
                .map(SubtarefaDTO::new)
                .toList();
    }

    @Transactional
    public List<SubtarefaDTO> dividirEmSubtarefas(Long tarefaId, List<SubtarefaDivisaoItemDTO> itens) {
        Tarefa tarefa = tarefaRepository.findByIdActive(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        if (subtarefaRepository.existsByTarefaId(tarefaId)) {
            throw new SubtarefaDivisaoInvalidaException("Esta tarefa já foi dividida em subtarefas.");
        }

        Set<User> users = tarefa.getUsers();
        if (users.isEmpty()) {
            throw new SubtarefaDivisaoInvalidaException("Tarefa não tem colaboradores atribuídos.");
        }
        if (users.size() == 1) {
            throw new SubtarefaDivisaoInvalidaException("Tarefa tem apenas um colaborador atribuído; divisão não é necessária.");
        }

        List<User> orderedUsers = users.stream()
                .sorted(Comparator.comparing(User::getId))
                .toList();

        Map<Long, String> descricaoPorUserId = new HashMap<>();
        if (itens != null) {
            for (SubtarefaDivisaoItemDTO item : itens) {
                if (item.getUserId() != null) {
                    descricaoPorUserId.putIfAbsent(item.getUserId(), item.getDescricao());
                }
            }
        }

        int n = orderedUsers.size();
        BigDecimal base = BigDecimal.valueOf(100).divide(BigDecimal.valueOf(n), 2, RoundingMode.DOWN);
        BigDecimal ultimaFatia = BigDecimal.valueOf(100).subtract(base.multiply(BigDecimal.valueOf(n - 1)));

        LocalDateTime now = LocalDateTime.now();
        List<Subtarefa> subtarefas = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            User user = orderedUsers.get(i);
            Subtarefa subtarefa = new Subtarefa();
            subtarefa.setTarefa(tarefa);
            subtarefa.setUser(user);
            subtarefa.setDescricao(descricaoPorUserId.get(user.getId()));
            subtarefa.setPercentual(i == n - 1 ? ultimaFatia : base);
            subtarefa.setConcluida(false);
            subtarefa.setCreatedAt(now);
            subtarefas.add(subtarefa);
        }

        List<Subtarefa> saved;
        try {
            saved = subtarefaRepository.saveAll(subtarefas);
        } catch (DataIntegrityViolationException e) {
            throw new SubtarefaDivisaoInvalidaException("Esta tarefa já foi dividida em subtarefas.");
        }

        for (Subtarefa subtarefa : saved) {
            NotificationInsertDTO notification = NotificationInsertDTO.builder()
                    .type(NotificationType.SUBTAREFA_ATRIBUIDA.name())
                    .content("Foi-lhe atribuída uma subtarefa (" + subtarefa.getPercentual() + "%) em: " + tarefa.getDescricao())
                    .userId(subtarefa.getUser().getId())
                    .isRead(false)
                    .createdAt(new Date())
                    .relatedId(subtarefa.getId())
                    .tarefaId(tarefaId)
                    .build();
            notificationService.processNotification(notification);
        }

        return saved.stream().map(SubtarefaDTO::new).toList();
    }

    @Transactional
    public SubtarefaDTO updateSubtarefa(Long tarefaId, Long subtarefaId, String descricao) {
        Subtarefa subtarefa = subtarefaRepository.findByIdAndTarefaId(subtarefaId, tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtarefa não foi encontrada"));

        subtarefa.setDescricao(descricao);
        subtarefa = subtarefaRepository.save(subtarefa);

        return new SubtarefaDTO(subtarefa);
    }

    @Transactional
    public SubtarefaDTO concluirSubtarefa(Long tarefaId, Long subtarefaId) {
        Subtarefa subtarefa = subtarefaRepository.findByIdAndTarefaId(subtarefaId, tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtarefa não foi encontrada"));

        if (subtarefa.isConcluida()) {
            return new SubtarefaDTO(subtarefa);
        }

        subtarefa.setConcluida(true);
        subtarefa.setConcluidaEm(LocalDateTime.now());
        subtarefa = subtarefaRepository.save(subtarefa);

        NotificationInsertDTO notification = NotificationInsertDTO.builder()
                .type(NotificationType.SUBTAREFA_CONCLUIDA.name())
                .content(subtarefa.getUser().getName() + " concluiu a sua parte (" + subtarefa.getPercentual() + "%) em: "
                        + subtarefa.getTarefa().getDescricao())
                .userId(subtarefa.getUser().getId())
                .isRead(false)
                .createdAt(new Date())
                .relatedId(subtarefa.getId())
                .tarefaId(tarefaId)
                .build();
        notificationService.processNotification(notification);

        return new SubtarefaDTO(subtarefa);
    }

    @Transactional
    public SubtarefaDTO reabrirSubtarefa(Long tarefaId, Long subtarefaId) {
        Subtarefa subtarefa = subtarefaRepository.findByIdAndTarefaId(subtarefaId, tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtarefa não foi encontrada"));

        if (!subtarefa.isConcluida()) {
            return new SubtarefaDTO(subtarefa);
        }

        subtarefa.setConcluida(false);
        subtarefa.setConcluidaEm(null);
        subtarefa = subtarefaRepository.save(subtarefa);

        return new SubtarefaDTO(subtarefa);
    }

    @Transactional(readOnly = true)
    public boolean isOwnerOfSubtarefa(Long tarefaId, Long subtarefaId, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) return false;
        return subtarefaRepository.findByIdAndTarefaId(subtarefaId, tarefaId)
                .map(s -> s.getUser().getId().equals(user.getId()))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public void assertCanTransitionStatus(Long tarefaId) {
        if (!subtarefaRepository.existsByTarefaId(tarefaId)) {
            return;
        }
        BigDecimal percentual = subtarefaRepository.sumPercentualConcluidoByTarefaId(tarefaId);
        if (percentual.compareTo(new BigDecimal("100.00")) < 0) {
            throw new SubtarefasIncompletasException(
                    "Não é possível alterar o estado da tarefa: as subtarefas ainda não estão 100% concluídas (atual: "
                            + percentual + "%).");
        }
    }

}
