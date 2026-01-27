package com.fl.dashboard.services;

import com.fl.dashboard.dto.CollaboratorMetricsDTO;
import com.fl.dashboard.dto.ProjetoMetricsDTO;
import com.fl.dashboard.dto.TaskMetricsDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating and aggregating project metrics
 * Provides comprehensive statistics including:
 * - General KPIs (tasks, completion rates, working days)
 * - Status distribution
 * - Collaborator performance metrics
 * - Top longest tasks
 * - Project timeline information
 * <p>
 * Access control delegated to ProjetoService for consistency
 */
@Service
public class ProjetoMetricsService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoRepository projetoRepository;
    private final ProjetoService projetoService;

    public ProjetoMetricsService(
            TarefaRepository tarefaRepository,
            ProjetoRepository projetoRepository,
            ProjetoService projetoService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoRepository = projetoRepository;
        this.projetoService = projetoService;
    }

    /**
     * Check if user should be denied access to project metrics
     * Delegates to ProjetoService for consistent access control
     *
     * @param projetoId Project ID
     * @param userEmail User email
     * @return true if access should be denied, false otherwise
     */
    public boolean shouldDenyMetricsAccess(Long projetoId, String userEmail) {
        return projetoService.shouldDenyProjectAccess(projetoId, userEmail);
    }

    /**
     * Calculate comprehensive metrics for a specific project
     *
     * @param projetoId Project ID
     * @return ProjetoMetricsDTO with all calculated metrics
     * @throws RuntimeException if project not found
     */
    @Transactional(readOnly = true)
    public ProjetoMetricsDTO getProjetoMetrics(Long projetoId) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        // Filter tasks for this project (active tasks only)
        List<Tarefa> todasTarefas = tarefaRepository.findAllActive();
        List<Tarefa> tarefas = todasTarefas.stream()
                .filter(t -> t.getProjeto() != null && t.getProjeto().getId().equals(projetoId))
                .toList();

        // Initialize DTO with basic project info
        ProjetoMetricsDTO metrics = new ProjetoMetricsDTO(projetoId, projeto.getDesignacao());

        // Calculate all metrics
        calculateGeneralKPIs(metrics, tarefas);
        calculateStatusDistribution(metrics, tarefas);
        calculateTopLongestTasks(metrics, tarefas);
        calculateCollaboratorMetrics(metrics, tarefas);
        calculateProjectDates(metrics, tarefas);

        return metrics;
    }

    /**
     * Calculate general KPIs: total tasks, completion rate, average working days
     *
     * @param metrics DTO to populate
     * @param tarefas List of project tasks
     */
    private void calculateGeneralKPIs(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        metrics.setTotalTarefas(tarefas.size());

        int concluidas = countByStatus(tarefas, TarefaStatus.DONE);
        metrics.setTarefasConcluidas(concluidas);

        int emProgresso = countByStatus(tarefas, TarefaStatus.IN_PROGRESS, TarefaStatus.IN_REVIEW);
        metrics.setTarefasEmProgresso(emProgresso);

        int pendentes = countByStatus(tarefas, TarefaStatus.TODO, TarefaStatus.BACKLOG);
        metrics.setTarefasPendentes(pendentes);

        metrics.setTempoMedioDias(calculateAverageWorkingDays(tarefas));

        // Calculate completion rate percentage
        if (!tarefas.isEmpty()) {
            double taxa = (concluidas * 100.0) / tarefas.size();
            metrics.setTaxaConclusao(Math.round(taxa * 100.0) / 100.0);
        } else {
            metrics.setTaxaConclusao(0.0);
        }
    }

    /**
     * Count tasks matching any of the provided statuses
     *
     * @param tarefas  List of tasks
     * @param statuses Variable number of status values to match
     * @return Count of matching tasks
     */
    private int countByStatus(List<Tarefa> tarefas, TarefaStatus... statuses) {
        Set<TarefaStatus> statusSet = Set.of(statuses);
        return (int) tarefas.stream()
                .filter(t -> statusSet.contains(t.getStatus()))
                .count();
    }

    /**
     * Calculate average working days for completed tasks
     * Only considers tasks with status DONE and valid workingDays
     *
     * @param tarefas List of tasks
     * @return Average working days, or 0.0 if no completed tasks
     */
    private double calculateAverageWorkingDays(List<Tarefa> tarefas) {
        OptionalDouble average = tarefas.stream()
                .filter(t -> TarefaStatus.DONE.equals(t.getStatus()) && t.getWorkingDays() != null)
                .mapToInt(Tarefa::getWorkingDays)
                .average();

        return average.isPresent() ? average.getAsDouble() : 0.0;
    }

    /**
     * Calculate task distribution by status
     * Creates a map with status names as keys and task counts as values
     *
     * @param metrics DTO to populate
     * @param tarefas List of tasks
     */
    private void calculateStatusDistribution(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        Map<String, Integer> distribution = tarefas.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        metrics.setTarefasPorStatus(distribution);
    }

    /**
     * Find the top 10 tasks with longest duration (workingDays)
     *
     * @param metrics DTO to populate
     * @param tarefas List of tasks
     */
    private void calculateTopLongestTasks(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        List<TaskMetricsDTO> topTasks = tarefas.stream()
                .filter(t -> t.getWorkingDays() != null && t.getWorkingDays() > 0)
                .sorted(Comparator.comparing(Tarefa::getWorkingDays).reversed())
                .limit(10)
                .map(this::mapToTaskMetricsDTO)
                .toList();

        metrics.setTarefasMaisLongas(topTasks);
    }

    /**
     * Calculate metrics for each collaborator working on the project
     * Groups tasks by user and computes individual statistics
     * <p>
     * DTO field mapping:
     * - userId → colaboradorId (aligns with frontend expectations)
     * - nome → colaboradorNome (aligns with frontend expectations)
     * - Added tarefasPendentes field (calculated from totalTarefas - tarefasConcluidas - tarefasEmProgresso)
     *
     * @param metrics DTO to populate
     * @param tarefas List of project tasks
     */
    private void calculateCollaboratorMetrics(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        Map<User, List<Tarefa>> tarefasPorColaborador = new HashMap<>();

        // Group tasks by assigned users
        for (Tarefa tarefa : tarefas) {
            for (User user : tarefa.getUsers()) {
                tarefasPorColaborador
                        .computeIfAbsent(user, k -> new ArrayList<>())
                        .add(tarefa);
            }
        }

        // Calculate metrics for each collaborator
        List<CollaboratorMetricsDTO> colaboradores = tarefasPorColaborador.entrySet().stream()
                .map(entry -> {
                    User user = entry.getKey();
                    List<Tarefa> tarefasDoUser = entry.getValue();

                    // Initialize DTO with user info
                    // ✅ Maps to colaboradorId and colaboradorNome (frontend expects these names)
                    CollaboratorMetricsDTO colabMetrics = new CollaboratorMetricsDTO(
                            user.getId(),
                            user.getName() != null ? user.getName() : "Desconhecido"
                    );

                    // Set task counts
                    int totalTarefas = tarefasDoUser.size();
                    int tarefasConcluidas = countByStatus(tarefasDoUser, TarefaStatus.DONE);
                    int tarefasEmProgresso = countByStatus(tarefasDoUser, TarefaStatus.IN_PROGRESS, TarefaStatus.IN_REVIEW);
                    int tarefasPendentes = countByStatus(tarefasDoUser, TarefaStatus.TODO, TarefaStatus.BACKLOG);

                    colabMetrics.setTotalTarefas(totalTarefas);
                    colabMetrics.setTarefasConcluidas(tarefasConcluidas);
                    colabMetrics.setTarefasEmProgresso(tarefasEmProgresso);
                    colabMetrics.setTarefasPendentes(tarefasPendentes);
                    colabMetrics.setTempoMedioDias(calculateAverageWorkingDays(tarefasDoUser));

                    // Calculate status distribution for this collaborator
                    Map<String, Integer> statusDist = tarefasDoUser.stream()
                            .collect(Collectors.groupingBy(
                                    t -> t.getStatus().name(),
                                    Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                            ));
                    colabMetrics.setTarefasPorStatus(statusDist);

                    return colabMetrics;
                })
                .sorted(Comparator.comparing(CollaboratorMetricsDTO::getTotalTarefas).reversed())
                .toList();

        metrics.setColaboradores(colaboradores);
    }

    /**
     * Calculate project start and end dates based on task deadlines
     *
     * @param metrics DTO to populate
     * @param tarefas List of tasks
     */
    private void calculateProjectDates(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        // Find earliest estimated deadline
        Optional<LocalDate> primeiraData = tarefas.stream()
                .filter(t -> t.getPrazoEstimado() != null)
                .map(t -> t.getPrazoEstimado().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate())
                .min(Comparator.naturalOrder());

        primeiraData.ifPresent(metrics::setPrimeiraDataInicio);

        // Find latest completion date among done tasks
        Optional<LocalDate> ultimaData = tarefas.stream()
                .filter(t -> TarefaStatus.DONE.equals(t.getStatus()) && t.getPrazoReal() != null)
                .map(t -> t.getPrazoReal().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate())
                .max(Comparator.naturalOrder());

        ultimaData.ifPresent(metrics::setUltimaDataConclusao);
    }

    /**
     * Map Tarefa entity to TaskMetricsDTO
     * Used for "longest tasks" list
     *
     * @param tarefa Task entity
     * @return TaskMetricsDTO with task details
     */
    private TaskMetricsDTO mapToTaskMetricsDTO(Tarefa tarefa) {
        TaskMetricsDTO dto = new TaskMetricsDTO();
        dto.setTarefaId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrioridade(tarefa.getPrioridade());

        if (tarefa.getPrazoEstimado() != null) {
            dto.setDataInicio(tarefa.getPrazoEstimado().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate());
        }

        if (tarefa.getPrazoReal() != null) {
            dto.setDataFim(tarefa.getPrazoReal().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate());
        }

        dto.setWorkingDays(tarefa.getWorkingDays());
        dto.setStatus(tarefa.getStatus().name());

        // Extract collaborator names
        List<String> nomes = tarefa.getUsers().stream()
                .map(user -> user.getName() != null ? user.getName() : "Desconhecido")
                .toList();
        dto.setColaboradores(nomes);

        return dto;
    }
}