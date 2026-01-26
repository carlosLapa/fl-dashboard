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
import com.fl.dashboard.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjetoMetricsService {

    private final TarefaRepository tarefaRepository;
    private final ProjetoRepository projetoRepository;
    private final UserRepository userRepository;
    private final ProjetoService projetoService;

    public ProjetoMetricsService(TarefaRepository tarefaRepository, ProjetoRepository projetoRepository, UserRepository userRepository, ProjetoService projetoService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoRepository = projetoRepository;
        this.userRepository = userRepository;
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

    @Transactional(readOnly = true)
    public ProjetoMetricsDTO getProjetoMetrics(Long projetoId) {
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

        List<Tarefa> todasTarefas = tarefaRepository.findAllActive();
        List<Tarefa> tarefas = todasTarefas.stream()
                .filter(t -> t.getProjeto() != null && t.getProjeto().getId().equals(projetoId))
                .toList();

        ProjetoMetricsDTO metrics = new ProjetoMetricsDTO(projetoId, projeto.getDesignacao());

        calculateGeneralKPIs(metrics, tarefas);
        calculateStatusDistribution(metrics, tarefas);
        calculateTopLongestTasks(metrics, tarefas);
        calculateCollaboratorMetrics(metrics, tarefas);
        calculateProjectDates(metrics, tarefas);

        return metrics;
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth instanceof JwtAuthenticationToken jwtToken) {
            return jwtToken.getToken().getClaimAsString("email");
        }

        return auth.getName();
    }

    private void calculateGeneralKPIs(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        metrics.setTotalTarefas(tarefas.size());

        int concluidas = countByStatus(tarefas, TarefaStatus.DONE);
        metrics.setTarefasConcluidas(concluidas);

        int emProgresso = countByStatus(tarefas, TarefaStatus.IN_PROGRESS, TarefaStatus.IN_REVIEW);
        metrics.setTarefasEmProgresso(emProgresso);

        int pendentes = countByStatus(tarefas, TarefaStatus.TODO, TarefaStatus.BACKLOG);
        metrics.setTarefasPendentes(pendentes);

        metrics.setTempoMedioDias(calculateAverageWorkingDays(tarefas));

        if (!tarefas.isEmpty()) {
            double taxa = (concluidas * 100.0) / tarefas.size();
            metrics.setTaxaConclusao(Math.round(taxa * 100.0) / 100.0);
        } else {
            metrics.setTaxaConclusao(0.0);
        }
    }

    private int countByStatus(List<Tarefa> tarefas, TarefaStatus... statuses) {
        Set<TarefaStatus> statusSet = Set.of(statuses);
        return (int) tarefas.stream()
                .filter(t -> statusSet.contains(t.getStatus()))
                .count();
    }

    private double calculateAverageWorkingDays(List<Tarefa> tarefas) {
        OptionalDouble average = tarefas.stream()
                .filter(t -> TarefaStatus.DONE.equals(t.getStatus()) && t.getWorkingDays() != null)
                .mapToInt(Tarefa::getWorkingDays)
                .average();

        return average.isPresent() ? average.getAsDouble() : 0.0;
    }

    private void calculateStatusDistribution(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        Map<String, Integer> distribution = tarefas.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getStatus().name(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        metrics.setTarefasPorStatus(distribution);
    }

    private void calculateTopLongestTasks(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        List<TaskMetricsDTO> topTasks = tarefas.stream()
                .filter(t -> t.getWorkingDays() != null && t.getWorkingDays() > 0)
                .sorted(Comparator.comparing(Tarefa::getWorkingDays).reversed())
                .limit(10)
                .map(this::mapToTaskMetricsDTO)
                .toList();

        metrics.setTarefasMaisLongas(topTasks);
    }

    private void calculateCollaboratorMetrics(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        Map<User, List<Tarefa>> tarefasPorColaborador = new HashMap<>();

        for (Tarefa tarefa : tarefas) {
            for (User user : tarefa.getUsers()) {
                tarefasPorColaborador
                        .computeIfAbsent(user, k -> new ArrayList<>())
                        .add(tarefa);
            }
        }

        List<CollaboratorMetricsDTO> colaboradores = tarefasPorColaborador.entrySet().stream()
                .map(entry -> {
                    User user = entry.getKey();
                    List<Tarefa> tarefasDoUser = entry.getValue();

                    CollaboratorMetricsDTO colabMetrics = new CollaboratorMetricsDTO(user.getId(), user.getName());
                    colabMetrics.setTotalTarefas(tarefasDoUser.size());
                    colabMetrics.setTarefasConcluidas(countByStatus(tarefasDoUser, TarefaStatus.DONE));
                    colabMetrics.setTarefasEmProgresso(countByStatus(tarefasDoUser, TarefaStatus.IN_PROGRESS, TarefaStatus.IN_REVIEW));
                    colabMetrics.setTempoMedioDias(calculateAverageWorkingDays(tarefasDoUser));

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

    private void calculateProjectDates(ProjetoMetricsDTO metrics, List<Tarefa> tarefas) {
        Optional<LocalDate> primeiraData = tarefas.stream()
                .filter(t -> t.getPrazoEstimado() != null)
                .map(t -> t.getPrazoEstimado().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate())
                .min(Comparator.naturalOrder());

        primeiraData.ifPresent(metrics::setPrimeiraDataInicio);

        Optional<LocalDate> ultimaData = tarefas.stream()
                .filter(t -> TarefaStatus.DONE.equals(t.getStatus()) && t.getPrazoReal() != null)
                .map(t -> t.getPrazoReal().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate())
                .max(Comparator.naturalOrder());

        ultimaData.ifPresent(metrics::setUltimaDataConclusao);
    }

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

        List<String> nomes = tarefa.getUsers().stream()
                .map(User::getName)
                .toList();
        dto.setColaboradores(nomes);

        return dto;
    }
}