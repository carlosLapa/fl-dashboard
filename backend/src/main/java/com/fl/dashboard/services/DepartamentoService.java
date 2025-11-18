package com.fl.dashboard.services;

import com.fl.dashboard.dto.DepartamentoDTO;
import com.fl.dashboard.entities.Departamento;
import com.fl.dashboard.repositories.DepartamentoRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartamentoService {

    private final DepartamentoRepository departamentoRepository;

    public DepartamentoService(DepartamentoRepository departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartamentoDTO> findAll() {
        List<Departamento> list = departamentoRepository.findAll();
        return list.stream()
                .map(DepartamentoDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartamentoDTO findById(Long id) {
        Departamento entity = departamentoRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Tarefa com o id " + id + " não encontrado"));
        return new DepartamentoDTO(entity);
    }

    @Transactional
    public DepartamentoDTO insert(DepartamentoDTO departamentoDTO) {
        Departamento entity = new Departamento();
        copyDTOtoEntity(departamentoDTO, entity);
        // entity = tarefaRepository.save(entity);
        departamentoRepository.save(entity);
        return new DepartamentoDTO(entity);
    }

    @Transactional
    public DepartamentoDTO update(Long id, DepartamentoDTO departamentoDTO) {
        try {
            Departamento entity = departamentoRepository.getReferenceById(id);
            copyDTOtoEntity(departamentoDTO, entity);
            entity = departamentoRepository.save(entity);  // Ensure entity is saved after updating
            return new DepartamentoDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if (!departamentoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            departamentoRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(("Não permitido! Integridade da BD em causa"));
        }
    }

    private void copyDTOtoEntity(DepartamentoDTO departamentoDTO, Departamento entity) {
        entity.setDesignacao(departamentoDTO.getDesignacao());
        entity.setDescricao(departamentoDTO.getDescricao());
    }

}
