package com.fl.dashboard.services;

import com.fl.dashboard.dto.ProjetoFaseDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.ProjetoFase;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.repositories.ProjetoFaseRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.services.exceptions.FaseInvalidaException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ProjetoFaseService {

    private final ProjetoFaseRepository faseRepository;
    private final ProjetoRepository projetoRepository;

    public ProjetoFaseService(ProjetoFaseRepository faseRepository, ProjetoRepository projetoRepository) {
        this.faseRepository = faseRepository;
        this.projetoRepository = projetoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjetoFaseDTO> findByProjeto(Long projetoId) {
        findProjetoAtivo(projetoId);
        return faseRepository.findByProjetoIdOrdered(projetoId).stream().map(ProjetoFaseDTO::new).toList();
    }

    @Transactional
    public ProjetoFaseDTO insert(Long projetoId, ProjetoFaseDTO dto) {
        Projeto projeto = findProjetoAtivo(projetoId);
        validarDatas(dto);

        ProjetoFase fase = new ProjetoFase();
        fase.setProjeto(projeto);
        copiarCampos(dto, fase);
        fase.setOrdem(dto.getOrdem() != null ? dto.getOrdem() : faseRepository.findMaxOrdem(projetoId) + 1);
        return new ProjetoFaseDTO(faseRepository.save(fase));
    }

    // Ordem is left untouched here; it only changes through reordenar, so a stale form can't
    // silently undo a reorder made in the meantime.
    @Transactional
    public ProjetoFaseDTO update(Long projetoId, Long faseId, ProjetoFaseDTO dto) {
        findProjetoAtivo(projetoId);
        validarDatas(dto);

        ProjetoFase fase = findFase(projetoId, faseId);
        copiarCampos(dto, fase);
        return new ProjetoFaseDTO(faseRepository.save(fase));
    }

    @Transactional
    public void delete(Long projetoId, Long faseId) {
        findProjetoAtivo(projetoId);
        ProjetoFase fase = findFase(projetoId, faseId);
        faseRepository.desassociarTarefas(fase.getId());
        faseRepository.delete(fase);
    }

    // faseIds must be exactly the projeto's phases, in the new order; anything else is rejected rather
    // than half-applied.
    @Transactional
    public List<ProjetoFaseDTO> reordenar(Long projetoId, List<Long> faseIds) {
        findProjetoAtivo(projetoId);
        List<ProjetoFase> fases = faseRepository.findByProjetoIdOrdered(projetoId);

        if (faseIds == null || faseIds.size() != fases.size() || new HashSet<>(faseIds).size() != faseIds.size()) {
            throw new FaseInvalidaException("A lista de fases não corresponde às fases do projeto");
        }
        Map<Long, ProjetoFase> porId = fases.stream().collect(Collectors.toMap(ProjetoFase::getId, Function.identity()));
        for (int i = 0; i < faseIds.size(); i++) {
            ProjetoFase fase = porId.get(faseIds.get(i));
            if (fase == null) {
                throw new FaseInvalidaException("A fase " + faseIds.get(i) + " não pertence a este projeto");
            }
            fase.setOrdem(i);
        }
        faseRepository.saveAll(fases);
        return faseRepository.findByProjetoIdOrdered(projetoId).stream().map(ProjetoFaseDTO::new).toList();
    }

    // Used by TarefaService on insert/update: resolves the phase and checks it belongs to the
    // tarefa's own projeto, so a tarefa can never be grouped under another projeto's phase.
    public ProjetoFase resolverFaseParaTarefa(Tarefa tarefa, Long faseId) {
        if (faseId == null) {
            return null;
        }
        if (tarefa.getProjeto() == null) {
            throw new FaseInvalidaException("Uma tarefa sem projeto não pode ter fase");
        }
        return faseRepository.findByIdAndProjetoId(faseId, tarefa.getProjeto().getId())
                .orElseThrow(() -> new FaseInvalidaException("A fase indicada não pertence ao projeto da tarefa"));
    }

    private Projeto findProjetoAtivo(Long projetoId) {
        return projetoRepository.findByIdActive(projetoId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não foi encontrado"));
    }

    private ProjetoFase findFase(Long projetoId, Long faseId) {
        return faseRepository.findByIdAndProjetoId(faseId, projetoId)
                .orElseThrow(() -> new ResourceNotFoundException("Fase não foi encontrada"));
    }

    private void validarDatas(ProjetoFaseDTO dto) {
        if (dto.getDataInicio() != null && dto.getDataFim() != null && dto.getDataFim().isBefore(dto.getDataInicio())) {
            throw new FaseInvalidaException("A data de fim da fase não pode ser anterior à data de início");
        }
    }

    private void copiarCampos(ProjetoFaseDTO dto, ProjetoFase fase) {
        fase.setNome(dto.getNome().trim());
        fase.setDescricao(dto.getDescricao());
        fase.setDataInicio(dto.getDataInicio());
        fase.setDataFim(dto.getDataFim());
    }
}
