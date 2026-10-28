package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.EspecialidadesExterno;
import com.fl.dashboard.enums.ExternoEstadoAtividade;
import com.fl.dashboard.enums.ProjetoStatus;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ExternoService {

    private static final String EXTERNO_NOT_FOUND_MSG = "Externo com o id: ";
    private static final String NOT_FOUND_MSG = " não encontrado";

    private final ExternoRepository externoRepository;
    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;

    public ExternoService(ExternoRepository externoRepository, ProjetoRepository projetoRepository, TarefaRepository tarefaRepository) {
        this.externoRepository = externoRepository;
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
    }

    @Transactional(readOnly = true)
    public Page<ExternoDTO> findAllPaged(Pageable pageable) {
        Page<Externo> page = externoRepository.findAllActive(pageable);
        Page<ExternoDTO> dtoPage = page.map(ExternoDTO::new);
        applyEstadoAtividade(dtoPage.getContent());
        return dtoPage;
    }

    // Single aggregate query for the whole page instead of loading each Externo's projetos.
    private void applyEstadoAtividade(List<ExternoDTO> dtos) {
        if (dtos.isEmpty()) {
            return;
        }
        List<Long> ids = dtos.stream().map(ExternoDTO::getId).toList();
        Map<Long, Long> activeCountById = new HashMap<>();
        for (Object[] row : externoRepository.countActiveProjetosByExternoIds(
                ids, EnumSet.of(ProjetoStatus.ATIVO, ProjetoStatus.EM_PROGRESSO))) {
            activeCountById.put((Long) row[0], ((Number) row[1]).longValue());
        }
        for (ExternoDTO dto : dtos) {
            Long activeCount = activeCountById.get(dto.getId());
            if (activeCount == null) {
                dto.setEstadoAtividade(ExternoEstadoAtividade.SEM_PROJETOS);
            } else if (activeCount > 0) {
                dto.setEstadoAtividade(ExternoEstadoAtividade.ATIVO);
            } else {
                dto.setEstadoAtividade(ExternoEstadoAtividade.INATIVO);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ExternoDTO> findAll() {
        List<Externo> list = externoRepository.findAllActive();
        return list.stream().map(ExternoDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ExternoDTO findById(Long id) {
        Externo entity = externoRepository.findByIdAndActiveStatus(id)
                .orElseThrow(() -> new ResourceNotFoundException(EXTERNO_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
        return new ExternoDTO(entity);
    }

    @Transactional(readOnly = true)
    public ExternoWithProjetosDTO findByIdWithProjetos(Long id) {
        Externo entity = externoRepository.findByIdWithProjetos(id)
                .orElseThrow(() -> new ResourceNotFoundException(EXTERNO_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
        return new ExternoWithProjetosDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<ExternoWithProjetosDTO> findAllWithProjetos() {
        List<Externo> list = externoRepository.findAllWithProjetos();
        return list.stream().map(ExternoWithProjetosDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ExternoWithTarefasDTO findByIdWithTarefas(Long id) {
        Externo entity = externoRepository.findByIdAndActiveStatus(id)
                .orElseThrow(() -> new ResourceNotFoundException(EXTERNO_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
        return new ExternoWithTarefasDTO(entity, tarefaRepository.findAllActiveByExternoId(id));
    }

    @Transactional
    public List<TarefaDTO> getTarefasByExterno(Long externoId) {
        Externo externo = externoRepository.findByIdAndActiveStatus(externoId)
                .orElseThrow(() -> new ResourceNotFoundException("Externo not found with ID: " + externoId));
        Set<Tarefa> assignedTarefas = externo.getTarefas();
        return assignedTarefas.stream()
                .map(TarefaDTO::new)
                .toList();
    }

    @Transactional
    public ExternoDTO insert(ExternoInsertDTO dto) {
        Externo entity = new Externo();
        copyDTOtoEntity(dto, entity);
        entity = externoRepository.save(entity);
        return new ExternoDTO(entity);
    }

    @Transactional
    public ExternoWithProjetosDTO insertWithProjetos(ExternoWithProjetosDTO dto) {
        Externo entity = new Externo();
        copyDTOtoEntity(dto, entity);
        copyProjetosToEntity(dto, entity);
        entity = externoRepository.save(entity);
        return new ExternoWithProjetosDTO(entity);
    }

    @Transactional
    public ExternoDTO update(Long id, ExternoUpdateDTO dto) {
        try {
            Externo entity = externoRepository.getReferenceById(id);
            copyDTOtoEntity(dto, entity);
            entity = externoRepository.save(entity);
            return new ExternoDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional
    public ExternoWithProjetosDTO updateWithProjetos(Long id, ExternoWithProjetosDTO dto) {
        try {
            Externo entity = externoRepository.getReferenceById(id);
            copyDTOtoEntity(dto, entity);
            copyProjetosToEntity(dto, entity);
            entity = externoRepository.save(entity);
            return new ExternoWithProjetosDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!externoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            // Soft delete - set deletedAt timestamp instead of actually deleting
            Externo externo = externoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Externo não encontrado"));
            externo.setDeletedAt(Timestamp.from(Instant.now()));
            externoRepository.save(externo);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não permitido! Integridade da BD em causa: " + e.getMessage());
        }
    }

    @Transactional
    public void hardDelete(Long id) {
        if (!externoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            // Delete all associations first
            externoRepository.deleteProjetoExternoAssociationsByExternoId(id);
            externoRepository.deleteTarefaExternoAssociationsByExternoId(id);
            externoRepository.deleteExternoEspecialidadesAssociationsByExternoId(id);

            // Then delete the entity
            externoRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não permitido! Integridade da BD em causa: " + e.getMessage());
        }
    }

    private void copyDTOtoEntity(ExternoDTO dto, Externo entity) {
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setTelemovel(dto.getTelemovel());
        entity.setPreco(dto.getPreco());
        entity.setFaseProjeto(dto.getFaseProjeto());

        // Handle especialidades
        entity.getEspecialidades().clear();
        if (dto.getEspecialidades() != null) {
            for (EspecialidadesExterno especialidade : dto.getEspecialidades()) {
                entity.getEspecialidades().add(especialidade);
            }
        }
    }

    private void copyProjetosToEntity(ExternoWithProjetosDTO dto, Externo entity) {
        entity.getProjetos().clear();
        if (dto.getProjetos() != null) {
            dto.getProjetos().forEach(projetoDTO -> {
                Projeto projeto = projetoRepository.getReferenceById(projetoDTO.getId());
                entity.getProjetos().add(projeto);
            });
        }
    }

    @Transactional(readOnly = true)
    public List<ExternoDTO> searchExternos(String query) {
        if (query == null || query.isEmpty()) {
            List<Externo> list = externoRepository.findAll();
            return list.stream()
                    .map(ExternoDTO::new)
                    .toList();
        }
        List<Externo> externos = externoRepository.searchByNameOrEmail(query);
        return externos.stream()
                .map(ExternoDTO::new)
                .toList();
    }
}
