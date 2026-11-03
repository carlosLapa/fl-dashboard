package com.fl.dashboard.services;

import com.fl.dashboard.dto.NotificationInsertDTO;
import com.fl.dashboard.dto.RequisicaoEquipamentoDTO;
import com.fl.dashboard.dto.RequisicaoEquipamentoDetalheDTO;
import com.fl.dashboard.entities.Equipamento;
import com.fl.dashboard.entities.RequisicaoEquipamento;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.EquipamentoRepository;
import com.fl.dashboard.repositories.RequisicaoEquipamentoRepository;
import com.fl.dashboard.services.exceptions.RequisicaoInvalidaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

// Overlapping requisições are deliberately allowed: a conflict is reported (live in the tarefa
// modal, on the Equipamentos page, and by notification to the other tarefa's colaboradores) for
// people to sort out between themselves, never rejected on save.
@Service
public class RequisicaoEquipamentoService {

    private static final DateTimeFormatter DATA_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Long NENHUMA_TAREFA = -1L;

    private final RequisicaoEquipamentoRepository requisicaoRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final NotificationService notificationService;

    public RequisicaoEquipamentoService(RequisicaoEquipamentoRepository requisicaoRepository,
                                        EquipamentoRepository equipamentoRepository,
                                        NotificationService notificationService) {
        this.requisicaoRepository = requisicaoRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<RequisicaoEquipamentoDetalheDTO> findConflitos(Long equipamentoId, LocalDate dataInicio,
                                                               LocalDate dataFim, Long excludeTarefaId) {
        List<RequisicaoEquipamentoDetalheDTO> conflitos = requisicaoRepository.findConflitos(
                equipamentoId, dataInicio, dataFim, excludeTarefaId != null ? excludeTarefaId : NENHUMA_TAREFA);
        conflitos.forEach(conflito -> conflito.setConflito(true));
        preencherColaboradores(conflitos);
        return conflitos;
    }

    // Current and upcoming requisições, each flagged if it overlaps another tarefa's. Filtering on
    // dataFim alone is safe: anything overlapping an included row is itself still included.
    @Transactional(readOnly = true)
    public List<RequisicaoEquipamentoDetalheDTO> findAtuaisEFuturas() {
        List<RequisicaoEquipamentoDetalheDTO> requisicoes = requisicaoRepository.findAtivasDesde(LocalDate.now());

        Map<Long, List<RequisicaoEquipamentoDetalheDTO>> porEquipamento = requisicoes.stream()
                .collect(Collectors.groupingBy(RequisicaoEquipamentoDetalheDTO::getEquipamentoId));
        for (RequisicaoEquipamentoDetalheDTO requisicao : requisicoes) {
            requisicao.setConflito(porEquipamento.get(requisicao.getEquipamentoId()).stream()
                    .anyMatch(outra -> !outra.getTarefaId().equals(requisicao.getTarefaId())
                            && periodosSobrepostos(outra.getDataInicio(), outra.getDataFim(),
                            requisicao.getDataInicio(), requisicao.getDataFim())));
        }

        preencherColaboradores(requisicoes);
        return requisicoes;
    }

    // Reconciles the tarefa's requisições with the incoming list, the same way TarefaService.syncLinks
    // does, and returns those that are new or whose equipamento/period changed. A null list means the
    // caller didn't send the field at all, so nothing is touched (rather than dropping every requisição).
    public List<RequisicaoEquipamento> syncRequisicoes(Tarefa tarefa, List<RequisicaoEquipamentoDTO> dtos) {
        if (dtos == null) {
            return List.of();
        }
        validarPeriodos(dtos);

        Map<Long, RequisicaoEquipamento> existingById = tarefa.getRequisicoes().stream()
                .filter(requisicao -> requisicao.getId() != null)
                .collect(Collectors.toMap(RequisicaoEquipamento::getId, requisicao -> requisicao));

        List<RequisicaoEquipamento> updated = new ArrayList<>();
        List<RequisicaoEquipamento> alteradas = new ArrayList<>();
        for (RequisicaoEquipamentoDTO dto : dtos) {
            RequisicaoEquipamento requisicao = dto.getId() != null ? existingById.get(dto.getId()) : null;
            if (requisicao == null) {
                requisicao = new RequisicaoEquipamento();
                requisicao.setTarefa(tarefa);
            }
            boolean mesmoEquipamento = requisicao.getEquipamento() != null
                    && requisicao.getEquipamento().getId().equals(dto.getEquipamentoId());
            if (!mesmoEquipamento) {
                requisicao.setEquipamento(resolverEquipamentoAtivo(dto.getEquipamentoId()));
            }
            if (!mesmoEquipamento
                    || !dto.getDataInicio().equals(requisicao.getDataInicio())
                    || !dto.getDataFim().equals(requisicao.getDataFim())) {
                alteradas.add(requisicao);
            }
            requisicao.setDataInicio(dto.getDataInicio());
            requisicao.setDataFim(dto.getDataFim());
            requisicao.setObservacoes(dto.getObservacoes());
            updated.add(requisicao);
        }
        tarefa.getRequisicoes().clear();
        tarefa.getRequisicoes().addAll(updated);
        return alteradas;
    }

    // Tells the colaboradores of every other tarefa holding the same equipamento that a save just
    // created an overlap with them. The person saving already saw the warning live in the modal.
    public void notificarConflitos(Tarefa tarefa, List<RequisicaoEquipamento> alteradas) {
        if (alteradas.isEmpty() || tarefa.getStatus() == TarefaStatus.DONE || tarefa.isArquivada()) {
            return;
        }
        LocalDate hoje = LocalDate.now();
        for (RequisicaoEquipamento requisicao : alteradas) {
            if (requisicao.getDataFim().isBefore(hoje)) {
                continue;
            }
            List<RequisicaoEquipamentoDetalheDTO> conflitos = requisicaoRepository.findConflitos(
                    requisicao.getEquipamento().getId(), requisicao.getDataInicio(), requisicao.getDataFim(),
                    tarefa.getId());
            if (conflitos.isEmpty()) {
                continue;
            }
            Map<Long, Set<Long>> destinatarios = destinatariosPorTarefa(conflitos);
            Set<Long> tarefasNotificadas = new HashSet<>();
            for (RequisicaoEquipamentoDetalheDTO conflito : conflitos) {
                if (!tarefasNotificadas.add(conflito.getTarefaId())) {
                    continue;
                }
                String content = "O equipamento \"" + requisicao.getEquipamento().getNome()
                        + "\" foi também requisitado para a tarefa \"" + tarefa.getDescricao() + "\" ("
                        + DATA_FORMATTER.format(requisicao.getDataInicio()) + " a "
                        + DATA_FORMATTER.format(requisicao.getDataFim())
                        + "), em simultâneo com a sua tarefa \"" + conflito.getTarefaDescricao() + "\".";
                destinatarios.getOrDefault(conflito.getTarefaId(), Set.of()).forEach(userId ->
                        notificationService.processNotification(NotificationInsertDTO.builder()
                                .type(NotificationType.REQUISICAO_CONFLITO.name())
                                .content(content)
                                .userId(userId)
                                .isRead(false)
                                .createdAt(new Date())
                                .tarefaId(conflito.getTarefaId())
                                .build()));
            }
        }
    }

    private void validarPeriodos(List<RequisicaoEquipamentoDTO> dtos) {
        for (int i = 0; i < dtos.size(); i++) {
            RequisicaoEquipamentoDTO dto = dtos.get(i);
            if (dto.getDataFim().isBefore(dto.getDataInicio())) {
                throw new RequisicaoInvalidaException("A data de fim da requisição não pode ser anterior à data de início");
            }
            for (int j = i + 1; j < dtos.size(); j++) {
                RequisicaoEquipamentoDTO outra = dtos.get(j);
                if (dto.getEquipamentoId().equals(outra.getEquipamentoId())
                        && periodosSobrepostos(dto.getDataInicio(), dto.getDataFim(), outra.getDataInicio(), outra.getDataFim())) {
                    throw new RequisicaoInvalidaException("O mesmo equipamento está requisitado em períodos sobrepostos nesta tarefa");
                }
            }
        }
    }

    private Equipamento resolverEquipamentoAtivo(Long equipamentoId) {
        Equipamento equipamento = equipamentoRepository.findById(equipamentoId)
                .orElseThrow(() -> new RequisicaoInvalidaException("Equipamento não foi encontrado: " + equipamentoId));
        if (!Boolean.TRUE.equals(equipamento.getAtivo())) {
            throw new RequisicaoInvalidaException("O equipamento \"" + equipamento.getNome() + "\" está desativado");
        }
        return equipamento;
    }

    private boolean periodosSobrepostos(LocalDate inicioA, LocalDate fimA, LocalDate inicioB, LocalDate fimB) {
        return !inicioA.isAfter(fimB) && !fimA.isBefore(inicioB);
    }

    private void preencherColaboradores(List<RequisicaoEquipamentoDetalheDTO> requisicoes) {
        if (requisicoes.isEmpty()) {
            return;
        }
        Set<Long> tarefaIds = requisicoes.stream()
                .map(RequisicaoEquipamentoDetalheDTO::getTarefaId)
                .collect(Collectors.toSet());
        Map<Long, List<String>> nomesPorTarefa = new HashMap<>();
        for (Object[] row : requisicaoRepository.findColaboradoresByTarefaIds(tarefaIds)) {
            nomesPorTarefa.computeIfAbsent((Long) row[0], id -> new ArrayList<>()).add((String) row[2]);
        }
        requisicoes.forEach(requisicao ->
                requisicao.setColaboradores(nomesPorTarefa.getOrDefault(requisicao.getTarefaId(), List.of())));
    }

    private Map<Long, Set<Long>> destinatariosPorTarefa(List<RequisicaoEquipamentoDetalheDTO> conflitos) {
        Set<Long> tarefaIds = conflitos.stream()
                .map(RequisicaoEquipamentoDetalheDTO::getTarefaId)
                .collect(Collectors.toSet());
        Map<Long, Set<Long>> userIdsPorTarefa = new HashMap<>();
        for (Object[] row : requisicaoRepository.findColaboradoresByTarefaIds(tarefaIds)) {
            userIdsPorTarefa.computeIfAbsent((Long) row[0], id -> new HashSet<>()).add((Long) row[1]);
        }
        return userIdsPorTarefa;
    }
}
