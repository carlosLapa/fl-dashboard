package com.fl.dashboard.services;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TarefaService {
    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Transactional(readOnly = true)
    public List<TarefaDTO> findAll() {
        List<Tarefa> list = tarefaRepository.findAll();
        return list.stream().map(TarefaDTO::new).toList();
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
        tarefaRepository.save(entity);
        return new TarefaDTO(entity);
    }

    @Transactional
    public TarefaDTO update(Long id, TarefaDTO tarefaDTO) {
        try {
            Tarefa entity = tarefaRepository.getReferenceById(id);
            copyDTOtoEntity(tarefaDTO, entity);
            entity = tarefaRepository.save(entity);
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

    public List<TarefaDTO> getTarefasByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Tarefa> tarefas = tarefaRepository.findByAssignedUsers(user);
        return tarefas.stream().map(TarefaDTO::new).toList();
    }

    public List<TarefaDTO> getTarefasByProjeto(Long projetoId) {
        Projeto projeto = projetoRepository.findById(projetoId).orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
        List<Tarefa> tarefas = tarefaRepository.findByProjeto(projeto);
        return tarefas.stream().map(TarefaDTO::new).toList();
    }

    public List<TarefaDTO> getTarefasWithProjetoAndUsers() {
        List<Tarefa> tarefas = tarefaRepository.findAll();
        return tarefas.stream()
                .map(tarefa -> {
                    Projeto projeto = projetoRepository.findById(tarefa.getProjeto().getId()).orElse(null);
                    Set<User> assignedUsers = tarefa.getAssignedUsers().stream()
                            .map(user -> userRepository.findById(user.getId()).orElse(null))
                            .collect(Collectors.toSet());
                    return new TarefaDTO(tarefa, assignedUsers, projeto);
                }).toList();
    }
}
