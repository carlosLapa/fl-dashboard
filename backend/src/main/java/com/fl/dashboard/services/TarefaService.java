package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.TarefaRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private ExternoRepository externoRepository;

    @Autowired
    private NotificationService notificationService;

    // Method to calculate working days
    private Integer calculateWorkingDays(Date startDate, Date endDate) {
        if (startDate == null || endDate == null) {
            return null;
        }

        Calendar start = Calendar.getInstance();
        start.setTime(startDate);

        Calendar end = Calendar.getInstance();
        end.setTime(endDate);

        int workingDays = 0;

        // Set both calendars to midnight to ensure we're only comparing dates
        start.set(Calendar.HOUR_OF_DAY, 0);
        start.set(Calendar.MINUTE, 0);
        start.set(Calendar.SECOND, 0);
        start.set(Calendar.MILLISECOND, 0);

        end.set(Calendar.HOUR_OF_DAY, 0);
        end.set(Calendar.MINUTE, 0);
        end.set(Calendar.SECOND, 0);
        end.set(Calendar.MILLISECOND, 0);

        // Count working days
        while (!start.after(end)) {
            int dayOfWeek = start.get(Calendar.DAY_OF_WEEK);
            if (dayOfWeek != Calendar.SATURDAY && dayOfWeek != Calendar.SUNDAY) {
                workingDays++;
            }
            start.add(Calendar.DATE, 1);
        }

        return workingDays;
    }

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

        // Calculate working days if both dates are available
        if (entity.getPrazoEstimado() != null && entity.getPrazoReal() != null) {
            entity.setWorkingDays(calculateWorkingDays(entity.getPrazoEstimado(), entity.getPrazoReal()));
        }

        entity = tarefaRepository.save(entity);
        return new TarefaDTO(entity);
    }

    @Transactional
    public TarefaDTO update(Long id, TarefaDTO tarefaDTO) {
        try {
            Tarefa entity = tarefaRepository.findByIdActive(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Id: " + id + " não foi encontrado"));
            copyDTOtoEntity(tarefaDTO, entity);

            // Calculate working days if both dates are available
            if (entity.getPrazoEstimado() != null && entity.getPrazoReal() != null) {
                entity.setWorkingDays(calculateWorkingDays(entity.getPrazoEstimado(), entity.getPrazoReal()));
            }

            entity = tarefaRepository.save(entity);
            return new TarefaDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(readOnly = true)
    public List<TarefaDTO> findUpcomingDeadlines(int daysAhead) {
        LocalDate deadline = LocalDate.now().plusDays(daysAhead);
        return tarefaRepository.findByPrazoRealBeforeAndStatusNot(deadline, TarefaStatus.DONE)
                .stream()
                .map(TarefaDTO::new)
                .toList();
    }

    // To handle user associations
    @Transactional
    public void updateTarefaUsers(Long tarefaId, Set<Long> userIds) {
        Tarefa tarefa = tarefaRepository.findByIdActive(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        Set<User> previousUsers = new HashSet<>(tarefa.getUsers());
        tarefa.getUsers().clear();

        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilizador não foi encontrado"));
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
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        if (projetoId != null) {
            Projeto projeto = projetoRepository.findById(projetoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto não foi encontrado"));
            tarefa.setProjeto(projeto);
        } else {
            tarefa.setProjeto(null);
        }

        tarefaRepository.save(tarefa);
    }

    @Transactional
    public TarefaWithUserAndProjetoDTO updateWithAssociations(TarefaUpdateDTO dto) {
        Tarefa tarefa = tarefaRepository.findByIdActive(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        Set<User> previousUsers = new HashSet<>(tarefa.getUsers());
        Set<Externo> previousExternos = new HashSet<>(tarefa.getExternos()); // Add this line

        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setPrazoEstimado(dto.getPrazoEstimado());
        tarefa.setPrazoReal(dto.getPrazoReal());

        // Calculate working days if both dates are available
        if (tarefa.getPrazoEstimado() != null && tarefa.getPrazoReal() != null) {
            tarefa.setWorkingDays(calculateWorkingDays(tarefa.getPrazoEstimado(), tarefa.getPrazoReal()));
        }

        // Update projeto association
        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto não foi encontrado"));
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
                                .orElseThrow(() -> new ResourceNotFoundException("Utilizador não foi encontrado: " + userId));
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

        // Update externo associations - ADD THIS SECTION
        tarefa.getExternos().clear();
        if (dto.getExternoIds() != null && !dto.getExternoIds().isEmpty()) {
            Set<Externo> externos = dto.getExternoIds().stream()
                    .map(externoId -> externoRepository.findByIdAndActiveStatus(externoId)
                            .orElseThrow(() -> new ResourceNotFoundException("Externo não foi encontrado: " + externoId)))
                    .collect(Collectors.toSet());
            tarefa.setExternos(externos);
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

        // Set working days if provided in the DTO
        if (dto.getWorkingDays() != null) {
            tarefa.setWorkingDays(dto.getWorkingDays());
        }
        // Otherwise, calculate working days if both dates are available
        else if (tarefa.getPrazoEstimado() != null && tarefa.getPrazoReal() != null) {
            tarefa.setWorkingDays(calculateWorkingDays(tarefa.getPrazoEstimado(), tarefa.getPrazoReal()));
        }

        // Associate Projeto only if projetoId is provided
        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto não foi encontrado"));
            tarefa.setProjeto(projeto);
        }

        // Associate Users only if userIds are provided
        if (dto.getUserIds() != null && !dto.getUserIds().isEmpty()) {
            Set<User> users = dto.getUserIds().stream()
                    .map(userId -> userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Utilizador não foi encontrado: " + userId)))
                    .collect(Collectors.toSet());
            tarefa.setUsers(users);
        }

        // Associate Externos only if externoIds are provided - ADD THIS SECTION
        if (dto.getExternoIds() != null && !dto.getExternoIds().isEmpty()) {
            Set<Externo> externos = dto.getExternoIds().stream()
                    .map(externoId -> externoRepository.findByIdAndActiveStatus(externoId)
                            .orElseThrow(() -> new ResourceNotFoundException("Externo não foi encontrado: " + externoId)))
                    .collect(Collectors.toSet());
            tarefa.setExternos(externos);
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
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));
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
        entity.setWorkingDays(tarefaDTO.getWorkingDays());  // Copy working days from DTO

        // Calculate working days if not provided and both dates are available
        if (entity.getWorkingDays() == null && entity.getPrazoEstimado() != null && entity.getPrazoReal() != null) {
            entity.setWorkingDays(calculateWorkingDays(entity.getPrazoEstimado(), entity.getPrazoReal()));
        }

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
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada: " + id));
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

    @Transactional(readOnly = true)
    public List<TarefaWithUserAndProjetoDTO> findAllActiveByUserId(Long userId) {
        List<Tarefa> tarefas = tarefaRepository.findAllActiveByUserId(userId);
        return tarefas.stream().map(TarefaWithUserAndProjetoDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public Page<TarefaWithUserAndProjetoDTO> findAllActiveByUserIdPaginated(Long userId, int page, int size) {
        // Get paginated tasks without eager loading collections
        PageRequest pageRequest = PageRequest.of(page, size);
        // Use a query that doesn't trigger the in-memory pagination warning
        Page<Tarefa> tarefaPage = tarefaRepository.findAllActiveByUserIdPaginated(userId, pageRequest);
        if (tarefaPage.isEmpty()) {
            return Page.empty(pageRequest);
        }
        // Convert to DTOs using the constructor
        List<TarefaWithUserAndProjetoDTO> dtos = tarefaPage.getContent().stream()
                .map(tarefa -> {
                    // Ensure the collections are loaded within the transaction
                    Hibernate.initialize(tarefa.getUsers());
                    if (tarefa.getProjeto() != null) {
                        Hibernate.initialize(tarefa.getProjeto());
                    }
                    return new TarefaWithUserAndProjetoDTO(tarefa);
                })
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageRequest, tarefaPage.getTotalElements());
    }

    private TarefaWithUserAndProjetoDTO convertToDTO(Tarefa tarefa) {
        TarefaWithUserAndProjetoDTO dto = new TarefaWithUserAndProjetoDTO();
        // Map basic properties
        dto.setId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setStatus(tarefa.getStatus());
        dto.setPrioridade(tarefa.getPrioridade());
        dto.setPrazoEstimado(tarefa.getPrazoEstimado());
        dto.setPrazoReal(tarefa.getPrazoReal());
        dto.setWorkingDays(tarefa.getWorkingDays()); // Add working days to DTO

        // Map users (these will be loaded lazily)
        Set<UserDTO> userDtos = tarefa.getUsers().stream()
                .map(user -> {
                    UserDTO userDto = new UserDTO();
                    userDto.setId(user.getId());
                    userDto.setName(user.getName());
                    userDto.setEmail(user.getEmail());
                    userDto.setCargo(user.getCargo());
                    userDto.setFuncao(user.getFuncao());
                    userDto.setProfileImage(user.getProfileImage());
                    return userDto;
                })
                .collect(Collectors.toSet());
        dto.setUsers(userDtos);

        // Map projeto (this will be loaded lazily)
        if (tarefa.getProjeto() != null) {
            ProjetoDTO projetoDto = new ProjetoDTO();
            projetoDto.setId(tarefa.getProjeto().getId());
            projetoDto.setDesignacao(tarefa.getProjeto().getDesignacao());
            projetoDto.setEntidade(tarefa.getProjeto().getEntidade());
            projetoDto.setObservacao(tarefa.getProjeto().getObservacao());
            projetoDto.setPrazo(tarefa.getProjeto().getPrazo());
            projetoDto.setPrioridade(tarefa.getProjeto().getPrioridade());
            projetoDto.setProjetoAno(tarefa.getProjeto().getProjetoAno());
            projetoDto.setStatus(tarefa.getProjeto().getStatus());
            dto.setProjeto(projetoDto);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public Page<TarefaWithUserAndProjetoDTO> findByDateRange(String dateField, Date startDate, Date endDate, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        // If dates are not provided, return empty result
        if (startDate == null || endDate == null) {
            return Page.empty(pageRequest);
        }

        // Validate field parameter
        if (!dateField.equals("prazoEstimado") && !dateField.equals("prazoReal")) {
            throw new IllegalArgumentException("Field must be either 'prazoEstimado' or 'prazoReal'");
        }

        Page<Tarefa> tarefaPage = tarefaRepository.findByDateRange(dateField, startDate, endDate, pageRequest);
        if (tarefaPage.isEmpty()) {
            return Page.empty(pageRequest);
        }

        List<TarefaWithUserAndProjetoDTO> dtos = tarefaPage.getContent().stream()
                .map(tarefa -> {
                    // Ensure the collections are loaded within the transaction
                    Hibernate.initialize(tarefa.getUsers());
                    if (tarefa.getProjeto() != null) {
                        Hibernate.initialize(tarefa.getProjeto());
                    }
                    return new TarefaWithUserAndProjetoDTO(tarefa);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageRequest, tarefaPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<TarefaWithUserAndProjetoDTO> findAllSorted(String sortField, String sortDirection, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<Tarefa> tarefaPage = tarefaRepository.findAllActiveSorted(pageRequest);

        List<TarefaWithUserAndProjetoDTO> dtos = tarefaPage.getContent().stream()
                .map(tarefa -> {
                    Hibernate.initialize(tarefa.getUsers());
                    if (tarefa.getProjeto() != null) {
                        Hibernate.initialize(tarefa.getProjeto());
                    }
                    return new TarefaWithUserAndProjetoDTO(tarefa);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageRequest, tarefaPage.getTotalElements());
    }

    // Add a method to recalculate working days for a specific tarefa
    @Transactional
    public void recalculateWorkingDays(Long tarefaId) {
        Tarefa tarefa = tarefaRepository.findByIdActive(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        if (tarefa.getPrazoEstimado() != null && tarefa.getPrazoReal() != null) {
            tarefa.setWorkingDays(calculateWorkingDays(tarefa.getPrazoEstimado(), tarefa.getPrazoReal()));
            tarefaRepository.save(tarefa);
        }
    }

    // Add a method to update just the working days field
    @Transactional
    public TarefaDTO updateWorkingDays(Long id, Integer workingDays) {
        Tarefa tarefa = tarefaRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não foi encontrada"));

        tarefa.setWorkingDays(workingDays);
        tarefa = tarefaRepository.save(tarefa);

        return new TarefaDTO(tarefa);
    }

    @Transactional(readOnly = true)
    public Page<TarefaWithUserAndProjetoDTO> findWithFilters(
            TarefaFilterDTO filterDTO,
            int page,
            int size,
            String sortField,
            String sortDirection) {

        // Adjust end date to make the range inclusive
        Date adjustedEndDate = null;
        if (filterDTO.getEndDate() != null) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(filterDTO.getEndDate());
            calendar.add(Calendar.DATE, 1);
            adjustedEndDate = calendar.getTime();
        }

        // Create sort object
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        // Execute query with filters
        Page<Tarefa> tarefaPage = tarefaRepository.findWithFilters(
                filterDTO.getDescricao(),
                filterDTO.getStatus(),
                filterDTO.getProjetoId(),
                filterDTO.getDateField(),
                filterDTO.getStartDate(),
                adjustedEndDate,
                pageRequest
        );

        if (tarefaPage.isEmpty()) {
            return Page.empty(pageRequest);
        }

        // Convert to DTOs
        List<TarefaWithUserAndProjetoDTO> dtos = tarefaPage.getContent().stream()
                .map(tarefa -> {
                    // Ensure the collections are loaded within the transaction
                    Hibernate.initialize(tarefa.getUsers());
                    if (tarefa.getProjeto() != null) {
                        Hibernate.initialize(tarefa.getProjeto());
                    }
                    return new TarefaWithUserAndProjetoDTO(tarefa);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageRequest, tarefaPage.getTotalElements());
    }


}
