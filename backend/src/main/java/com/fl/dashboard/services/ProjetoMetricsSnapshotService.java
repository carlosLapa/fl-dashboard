package com.fl.dashboard.services;

import com.fl.dashboard.dto.ProjetoMetricsDTO;
import com.fl.dashboard.dto.ProjetoMetricsSnapshotDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.ProjetoMetricsSnapshot;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.SnapshotTriggerType;
import com.fl.dashboard.repositories.ProjetoMetricsSnapshotRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Creates and lists point-in-time snapshots of a project's metrics, for
 * later comparison (e.g. completion rate in January vs. August).
 * <p>
 * Snapshots are manual-only for now: a user with access to the project's
 * metrics explicitly captures the current state. Reuses
 * ProjetoMetricsService.getProjetoMetrics for the actual calculation, so the
 * numbers here can never drift from what the metrics page shows live.
 */
@Service
public class ProjetoMetricsSnapshotService {

    private final ProjetoMetricsSnapshotRepository snapshotRepository;
    private final ProjetoMetricsService projetoMetricsService;
    private final ProjetoRepository projetoRepository;
    private final UserRepository userRepository;

    public ProjetoMetricsSnapshotService(
            ProjetoMetricsSnapshotRepository snapshotRepository,
            ProjetoMetricsService projetoMetricsService,
            ProjetoRepository projetoRepository,
            UserRepository userRepository) {
        this.snapshotRepository = snapshotRepository;
        this.projetoMetricsService = projetoMetricsService;
        this.projetoRepository = projetoRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProjetoMetricsSnapshotDTO criarSnapshot(Long projetoId, String userEmail) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com ID: " + projetoId));

        ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(projetoId);

        ProjetoMetricsSnapshot snapshot = new ProjetoMetricsSnapshot();
        snapshot.setProjeto(projeto);
        snapshot.setSnapshotDate(LocalDate.now());
        snapshot.setTotalTarefas(metrics.getTotalTarefas());
        snapshot.setTarefasConcluidas(metrics.getTarefasConcluidas());
        snapshot.setTarefasEmProgresso(metrics.getTarefasEmProgresso());
        snapshot.setTarefasPendentes(metrics.getTarefasPendentes());
        snapshot.setTempoMedioDias(metrics.getTempoMedioDias());
        snapshot.setTaxaConclusao(metrics.getTaxaConclusao());
        snapshot.setTriggerType(SnapshotTriggerType.MANUAL);
        snapshot.setCreatedAt(LocalDateTime.now());

        if (userEmail != null) {
            User user = userRepository.findByEmail(userEmail);
            snapshot.setTriggeredByUser(user);
        }

        ProjetoMetricsSnapshot saved = snapshotRepository.save(snapshot);
        return new ProjetoMetricsSnapshotDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjetoMetricsSnapshotDTO> listarSnapshots(Long projetoId) {
        return snapshotRepository.findByProjetoIdOrderBySnapshotDateAsc(projetoId).stream()
                .map(ProjetoMetricsSnapshotDTO::new)
                .toList();
    }
}
