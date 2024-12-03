package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.fl.dashboard.utils.ProjetoDTOMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjetoService {

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetoDTOMapper projetoDTOMapper;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public ProjetoDTO findById(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
        return new ProjetoDTO(projeto);
    }

    @Transactional(readOnly = true)
    public Page<ProjetoWithUsersDTO> findAllPaged(Pageable pageable) {
        Page<Projeto> list = projetoRepository.findAll(pageable);
        return list.map(ProjetoWithUsersDTO::new);
    }

    @Transactional(readOnly = true)
    public ProjetoWithUsersDTO findByIdWithUsers(Long id) {
        Projeto entity = projetoRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Projeto com o id " + id + " não encontrado"));
        return new ProjetoWithUsersDTO(entity, entity.getUsers());
    }

    @Transactional(readOnly = true)
    public ProjetoWithTarefasDTO findProjetoWithTarefas(Long id) {
        Projeto projeto = projetoRepository.findByIdWithTarefas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found with id: " + id));

        System.out.println("Tarefas size: " + projeto.getTarefas().size());
        for (Tarefa tarefa : projeto.getTarefas()) {
            System.out.println("Tarefa: " + tarefa.getId() + " - " + tarefa.getDescricao());
        }

        return new ProjetoWithTarefasDTO(projeto);
    }

    @Transactional(readOnly = true)
    public ProjetoWithUsersAndTarefasDTO findProjetoWithUsersAndTarefas(Long id) {
        Projeto projeto = projetoRepository.findByIdWithUsersAndTarefas(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found with id: " + id));

        return new ProjetoWithUsersAndTarefasDTO(projeto);
    }

    @Transactional
    public ProjetoWithUsersDTO insert(ProjetoWithUsersDTO projetoDTO) {
        Projeto entity = new Projeto();
        projetoDTOMapper.copyDTOtoEntity(projetoDTO, entity);

        // Save and flush to ensure the entity is persisted
        Projeto savedEntity = projetoRepository.save(entity);
        projetoRepository.flush();

        ProjetoWithUsersDTO savedDTO = new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers());

        // Only create notification if project was saved successfully and has users
        if (savedEntity.getId() != null && !savedEntity.getUsers().isEmpty()) {
            User assignedUser = savedEntity.getUsers().iterator().next();
            notificationService.createProjectNotification(
                    savedDTO,
                    NotificationType.PROJETO_ATRIBUIDO,
                    new UserDTO(assignedUser)
            );
        }

        return savedDTO;
    }

    @Transactional
    public ProjetoWithUsersDTO update(Long id, ProjetoWithUsersDTO projetoDTO) {
        Projeto entity = projetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found: " + id));

        String oldStatus = entity.getStatus();
        Set<User> oldUsers = new HashSet<>(entity.getUsers());

        projetoDTOMapper.copyDTOtoEntity(projetoDTO, entity);
        Projeto savedEntity = projetoRepository.save(entity);
        projetoRepository.flush();

        // Determine notification type based on status change
        NotificationType notificationType = determineNotificationType(oldStatus, savedEntity.getStatus());

        // Find new users to notify about project assignment
        Set<User> newUsers = savedEntity.getUsers().stream()
                .filter(user -> !oldUsers.contains(user))
                .collect(Collectors.toSet());

        // Notify new users about project assignment
        newUsers.forEach(user ->
                notificationService.createProjectNotification(
                        new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                        NotificationType.PROJETO_ATRIBUIDO,
                        new UserDTO(user)
                )
        );

        // Notify all current users about project update
        savedEntity.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                        notificationType,
                        new UserDTO(user)
                )
        );

        return new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers());
    }

    private NotificationType determineNotificationType(String oldStatus, String newStatus) {
        if ("CONCLUIDO".equals(newStatus) && !newStatus.equals(oldStatus)) {
            return NotificationType.PROJETO_CONCLUIDO;
        }
        return NotificationType.PROJETO_ATUALIZADO;
    }

    @Transactional
    public ProjetoWithUsersDTO updateStatus(Long id, String status) {
        Projeto entity = projetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found: " + id));
        entity.setStatus(status);
        Projeto savedEntity = projetoRepository.save(entity);

        NotificationType notificationType = status.equals("CONCLUIDO")
                ? NotificationType.PROJETO_CONCLUIDO
                : NotificationType.PROJETO_ATUALIZADO;

        savedEntity.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                        notificationType,
                        new UserDTO(user)
                )
        );

        return new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers());
    }

    @Transactional
    public ProjetoDTO updateBasicInfo(Long id, ProjetoDTO projetoDTO) {
        try {
            Projeto entity = projetoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found: " + id));
            projetoDTOMapper.copyBasicDTOtoEntity(projetoDTO, entity);
            entity = projetoRepository.save(entity);
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

    @Transactional(readOnly = true)
    public List<ProjetoWithUsersAndTarefasDTO> searchProjetos(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<Projeto> projetos = projetoRepository.findByDesignacaoLikeIgnoreCaseOrEntidadeLikeIgnoreCase(searchQuery, searchQuery);
        return projetos.stream()
                .map(ProjetoWithUsersAndTarefasDTO::new)
                .toList();
    }

}
