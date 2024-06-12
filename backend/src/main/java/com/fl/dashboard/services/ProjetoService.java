package com.fl.dashboard.services;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.repositories.ProjetoRepository;
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
public class ProjetoService {

    @Autowired
    private ProjetoRepository projetoRepository;

    @Transactional(readOnly = true)
    public List<ProjetoDTO> findAll() {
        List<Projeto> list = projetoRepository.findAll();
        return list.stream().map(ProjetoDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjetoDTO findById(Long id) {
        Projeto entity = projetoRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Projeto com o id " + id + " não encontrado"));
        return new ProjetoDTO(entity);
    }

    @Transactional
    public ProjetoDTO insert(ProjetoDTO projetoDTO) {
        Projeto entity = new Projeto();
        copyDTOtoEntity(projetoDTO, entity);
        entity = projetoRepository.save(entity);
        return new ProjetoDTO(entity);
    }

    @Transactional
    public ProjetoDTO update(Long id, ProjetoDTO projetoDTO) {
        try {
            Projeto entity = projetoRepository.getReferenceById(id);
            copyDTOtoEntity(projetoDTO, entity);
            entity = projetoRepository.save(entity);  // Ensure entity is saved after updating
            return new ProjetoDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public void delete(Long id) {
        if (!projetoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            projetoRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(("Não permitido! Integridade da BD em causa"));
        }
    }

    private void copyDTOtoEntity(ProjetoDTO projetoDTO, Projeto entity) {
        entity.setProjetoAno(projetoDTO.getProjetoAno());
        entity.setDesignacao(projetoDTO.getDesignacao());
        entity.setEntidade(projetoDTO.getEntidade());
        entity.setPrazo(projetoDTO.getPrazo());
        entity.setPrioridade(projetoDTO.getPrioridade());
        entity.setObservacao(projetoDTO.getObservacao());
    }

}
