package com.fl.dashboard.services;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Transactional(readOnly = true)
    public List<TarefaDTO> findAll() {
        List<Tarefa> list = tarefaRepository.findAll();
        return list.stream().map(TarefaDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TarefaDTO findById(Long id) {
        Tarefa entity = tarefaRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Tarefa com o id " + id + " não encontrado"));
        return new TarefaDTO(entity);
    }

    @Transactional
    public TarefaDTO insert(TarefaDTO tarefaDTO) {
        Tarefa entity = new Tarefa();
        copyDTOtoEntity(tarefaDTO, entity);
        // entity = tarefaRepository.save(entity);
        tarefaRepository.save(entity);
        return new TarefaDTO(entity);
    }

    @Transactional
    public TarefaDTO update(Long id, TarefaDTO tarefaDTO) {
        try {
            Tarefa entity = tarefaRepository.getReferenceById(id);
            copyDTOtoEntity(tarefaDTO, entity);
            entity = tarefaRepository.save(entity);  // Ensure entity is saved after updating
            return new TarefaDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            tarefaRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(("Não permitido! Integridade da BD em causa"));
        }
    }

    private void copyDTOtoEntity(TarefaDTO tarefaDTO, Tarefa entity) {
        entity.setDescricao(tarefaDTO.getDescricao());
        entity.setPrioridade(tarefaDTO.getPrioridade());
        entity.setPrazoEstimado(tarefaDTO.getPrazoEstimado());
        entity.setPrazoReal(tarefaDTO.getPrazoReal());
    }
}
