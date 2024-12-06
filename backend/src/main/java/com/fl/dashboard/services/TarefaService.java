package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<TarefaDTO> findAll() {
        List<Tarefa> list = tarefaRepository.findAllActive();
        return list.stream().map(TarefaDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public List<TarefaWithUserAndProjetoDTO> findAllWithUsersAndProjeto() {
        List<Tarefa> list = tarefaRepository.findAllActive();
        return list.stream().map(TarefaWithUserAndProjetoDTO::new).toList();
    }

    /*
    public Page<TarefaDTO> findAllPaged(Pageable pageable) {
        Page<Tarefa> tarefas = tarefaRepository.findAll(pageable);
        return tarefas.map(TarefaDTO::new);
    }
    */

    @Transactional(readOnly = true)
    public TarefaDTO findById(Long id) {
        Tarefa entity = tarefaRepository.findByIdActive(id).orElseThrow(
                () -> new ResourceNotFoundException("Tarefa com o id " + id + " não encontrado"));
        return new TarefaDTO(entity);
    }

    @Transactional(readOnly = true)
    public TarefaWithUsersDTO findByIdWithUsers(Long id) {
        Tarefa entity = tarefaRepository.findByIdActive(id).orElseThrow(
                () -> new ResourceNotFoundException("Tarefa com o id " + id + " não encontrado"));
        return new TarefaWithUsersDTO(entity);
    }

    @Transactional(readOnly = true)
    public TarefaWithProjetoDTO findByIdWithProjeto(Long id) {
        Tarefa entity = tarefaRepository.findByIdActive(id).orElseThrow(
                () -> new ResourceNotFoundException("Tarefa com o id " + id + " não encontrado"));
        return new TarefaWithProjetoDTO(entity);
    }

    @Transactional(readOnly = true)
    public TarefaWithUserAndProjetoDTO findByIdWithUsersAndProjeto(Long id) {
        Tarefa tarefa = tarefaRepository.findByIdWithUsersAndProjeto(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found with id: " + id));
        return new TarefaWithUserAndProjetoDTO(tarefa);
    }

    @Transactional
    public TarefaDTO insert(TarefaDTO tarefaDTO) {
        Tarefa entity = new Tarefa();
        copyDTOtoEntity(tarefaDTO, entity);
        entity = tarefaRepository.save(entity);
        return new TarefaDTO(entity);
    }

    @Transactional
    public TarefaDTO update(Long id, TarefaDTO tarefaDTO) {
        try {
            Tarefa entity = tarefaRepository.findByIdActive(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Id: " + id + " não foi encontrado"));
            copyDTOtoEntity(tarefaDTO, entity);
            entity = tarefaRepository.save(entity);
            return new TarefaDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    // To handle user associations
    @Transactional
    public void updateTarefaUsers(Long tarefaId, Set<Long> userIds) {
        Tarefa tarefa = tarefaRepository.findByIdActive(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));

        Set<User> previousUsers = new HashSet<>(tarefa.getUsers());
        tarefa.getUsers().clear();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            tarefa.getUsers().add(user);

            if (!previousUsers.contains(user)) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.TAREFA_ATRIBUIDA.name())
                        .content("Foi-lhe atribuída a tarefa: " + tarefa.getDescricao())
                        .userId(userId)
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(tarefa.getId())
                        .build();

                notificationService.processNotification(notification);
            }
        }

        previousUsers.forEach(user -> {
            if (!userIds.contains(user.getId())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type("TAREFA_REMOVIDA")
                        .content("Foi removido/a da tarefa: " + tarefa.getDescricao())
                        .userId(user.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(tarefa.getId())
                        .build();

                notificationService.processNotification(notification);
            }
        });

        tarefaRepository.save(tarefa);
    }

    @Transactional
    public void updateTarefaProjeto(Long tarefaId, Long projetoId) {
        Tarefa tarefa = tarefaRepository.findByIdActive(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));

        if (projetoId != null) {
            Projeto projeto = projetoRepository.findById(projetoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
            tarefa.setProjeto(projeto);
        } else {
            tarefa.setProjeto(null);
        }

        tarefaRepository.save(tarefa);
    }

    @Transactional
    public TarefaWithUserAndProjetoDTO updateWithAssociations(TarefaUpdateDTO dto) {
        Tarefa tarefa = tarefaRepository.findByIdActive(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));

        Set<User> previousUsers = new HashSet<>(tarefa.getUsers());

        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazoEstimado(dto.getPrazoEstimado());
        tarefa.setPrazoReal(dto.getPrazoReal());

        // Update projeto association
        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
            tarefa.setProjeto(projeto);
        } else {
            tarefa.setProjeto(null);  // Remove projeto association if projetoId is null
        }

        // Update user associations with notifications
        tarefa.getUsers().clear();
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            Set<User> users = dto.getUserIds().stream()
                    .map(userId -> {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

                        if (!previousUsers.contains(user)) {
                            NotificationInsertDTO notification = NotificationInsertDTO.builder()
                                    .type("TAREFA_ATRIBUIDA")
                                    .content("Foi-lhe atribuída a tarefa: " + tarefa.getDescricao())
                                    .userId(userId)
                                    .isRead(false)
                                    .createdAt(new Date())
                                    .tarefaId(tarefa.getId())
                                    .build();
                            notificationService.processNotification(notification);
                        }
                        return user;
                    })
                    .collect(Collectors.toSet());
            tarefa.setUsers(users);
        }

        // Notify users who were removed
        previousUsers.forEach(user -> {
            if (dto.getUserIds() == null || !dto.getUserIds().contains(user.getId())) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type("TAREFA_REMOVIDA")
                        .content("Foi removido/a da tarefa: " + tarefa.getDescricao())
                        .userId(user.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(tarefa.getId())
                        .build();
                notificationService.processNotification(notification);
            }
        });

        Tarefa savedTarefa = tarefaRepository.save(tarefa);
        return new TarefaWithUserAndProjetoDTO(savedTarefa);
    }

    @Transactional
    public TarefaWithUserAndProjetoDTO insertWithAssociations(TarefaInsertDTO dto) {
        Tarefa tarefa = new Tarefa();
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazoEstimado(dto.getPrazoEstimado());
        tarefa.setPrazoReal(dto.getPrazoReal());

        // Associate Projeto only if projetoId is provided
        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
            tarefa.setProjeto(projeto);
        }

        // Associate Users only if userIds are provided
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            Set<User> users = dto.getUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId)))
                    .collect(Collectors.toSet());
            tarefa.setUsers(users);
        }

        Tarefa savedTarefa = tarefaRepository.save(tarefa);

        // Send notifications to all assigned users
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            dto.getUserIds().forEach(userId -> {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type("TAREFA_ATRIBUIDA")
                        .content("Foi-lhe atribuída uma nova tarefa: " + savedTarefa.getDescricao())
                        .userId(userId)
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(savedTarefa.getId())
                        .build();

                notificationService.processNotification(notification);
            });
        }

        return new TarefaWithUserAndProjetoDTO(savedTarefa);
    }

    @Transactional
    public TarefaDTO updateStatus(Long id, TarefaStatus newStatus) {
        Tarefa tarefa = tarefaRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));

        TarefaStatus previousStatus = tarefa.getStatus();
        String descricao = tarefa.getDescricao();
        Long tarefaId = tarefa.getId();

        tarefa.setStatus(newStatus);

        tarefa.getUsers().forEach(user -> {
            NotificationInsertDTO notification = NotificationInsertDTO.builder()
                    .type(NotificationType.TAREFA_STATUS_ALTERADO.name())
                    .content("Estado da tarefa '" + descricao + "' alterado de " + previousStatus + " para " + newStatus)
                    .userId(user.getId())
                    .isRead(false)
                    .createdAt(new Date())
                    .tarefaId(tarefaId)
                    .build();

            notificationService.processNotification(notification);
        });

        tarefa = tarefaRepository.save(tarefa);
        return new TarefaDTO(tarefa);
    }

    private void copyDTOtoEntity(TarefaDTO tarefaDTO, Tarefa entity) {
        // Store original values for comparison
        String oldDescricao = entity.getDescricao();
        String oldPrioridade = entity.getPrioridade();
        Date oldPrazoEstimado = entity.getPrazoEstimado();
        Date oldPrazoReal = entity.getPrazoReal();

        // Update entity
        entity.setDescricao(tarefaDTO.getDescricao());
        entity.setPrioridade(tarefaDTO.getPrioridade());
        entity.setPrazoEstimado(tarefaDTO.getPrazoEstimado());
        entity.setPrazoReal(tarefaDTO.getPrazoReal());

        // Check for changes and notify users
        if (!entity.getDescricao().equals(oldDescricao) ||
                !entity.getPrioridade().equals(oldPrioridade) ||
                !Objects.equals(entity.getPrazoEstimado(), oldPrazoEstimado) ||
                !Objects.equals(entity.getPrazoReal(), oldPrazoReal)) {

            entity.getUsers().forEach(user -> {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.TAREFA_EDITADA.name())
                        .content("A tarefa '" + entity.getDescricao() + "' foi atualizada")
                        .userId(user.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(entity.getId())
                        .build();

                notificationService.processNotification(notification);
            });
        }
    }

    @Transactional(readOnly = true)
    private Tarefa findByIdForDelete(Long id) {
        return tarefaRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa not found"));
    }

    @Transactional
    public void delete(Long id) {
        try {
            Tarefa tarefa = findByIdForDelete(id);

            // Notify all users associated with the task before deletion
            tarefa.getUsers().forEach(user -> {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.TAREFA_REMOVIDA.name())
                        .content("A tarefa '" + tarefa.getDescricao() + "' foi removida")
                        .userId(user.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .tarefaId(tarefa.getId())
                        .build();

                notificationService.processNotification(notification);
            });

            tarefa.markAsDeleted();
            tarefaRepository.save(tarefa);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(readOnly = true)
    public List<TarefaWithUserAndProjetoDTO> searchTarefas(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<Tarefa> tarefas = tarefaRepository.findByDescricaoLikeIgnoreCaseOrStatusLikeIgnoreCase(searchQuery, searchQuery);
        return tarefas.stream()
                .map(TarefaWithUserAndProjetoDTO::new)
                .toList();
    }

}
