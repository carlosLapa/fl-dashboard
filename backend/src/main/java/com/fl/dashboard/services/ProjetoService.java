package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.fl.dashboard.utils.ProjetoDTOMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
        Projeto projeto = projetoRepository.findByIdActive(id)  // Changed from findById
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

        // Filtrar tarefas apagadas diretamente no DTO
        ProjetoWithUsersAndTarefasDTO dto = new ProjetoWithUsersAndTarefasDTO(projeto);

        // Garantir que tarefas seja inicializado como um HashSet vazio se estiver null
        if (dto.getTarefas() == null) {
            dto.setTarefas(new HashSet<>());
        }

        return dto;
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
            for (User user : savedEntity.getUsers()) {
                notificationService.createProjectNotification(
                        savedDTO,
                        NotificationType.PROJETO_ATRIBUIDO,  // Already correct
                        new UserDTO(user)
                );
            }
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
        Set<User> newUsers = new HashSet<>();
        for (User user1 : savedEntity.getUsers()) {
            if (!oldUsers.contains(user1)) {
                newUsers.add(user1);
            }
        }

        // Notify new users about project assignment
        for (User newUser : newUsers) {
            notificationService.createProjectNotification(
                    new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                    NotificationType.PROJETO_ATRIBUIDO,
                    new UserDTO(newUser)
            );
        }

        for (User oldUser : oldUsers) {
            if (!savedEntity.getUsers().contains(oldUser)) {
                NotificationInsertDTO notification = NotificationInsertDTO.builder()
                        .type(NotificationType.PROJETO_REMOVIDO.name())
                        .content("Foi removido/a do projeto: " + savedEntity.getDesignacao())
                        .userId(oldUser.getId())
                        .isRead(false)
                        .createdAt(new Date())
                        .projetoId(savedEntity.getId())
                        .build();

                notificationService.processNotification(notification);
            }
        }

        // Notify all current users about project update
        for (User user : savedEntity.getUsers()) {
            notificationService.createProjectNotification(
                    new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                    notificationType,
                    new UserDTO(user)
            );
        }

        return new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers());
    }

    private NotificationType determineNotificationType(String oldStatus, String newStatus) {
        if ("CONCLUIDO".equals(newStatus) && !newStatus.equals(oldStatus)) {
            return NotificationType.PROJETO_CONCLUIDO;
        } else if (!newStatus.equals(oldStatus)) {
            return NotificationType.PROJETO_STATUS_ALTERADO;
        }
        return NotificationType.PROJETO_EDITADO;
    }

    @Transactional
    public ProjetoWithUsersDTO updateStatus(Long id, String status) {
        Projeto entity = projetoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found: " + id));
        entity.setStatus(status);
        Projeto savedEntity = projetoRepository.save(entity);

        NotificationType notificationType = status.equals("CONCLUIDO")
                ? NotificationType.PROJETO_CONCLUIDO
                : NotificationType.PROJETO_STATUS_ALTERADO;  // Changed from PROJETO_ATUALIZADO

        for (User user : savedEntity.getUsers()) {
            notificationService.createProjectNotification(
                    new ProjetoWithUsersDTO(savedEntity, savedEntity.getUsers()),
                    notificationType,
                    new UserDTO(user)
            );
        }

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

    @Transactional
    public void delete(Long id) {
        try {
            Projeto projeto = findByIdForDelete(id);
            // Mark all associated tasks as deleted
            for (Tarefa tarefa : projeto.getTarefas()) {
                tarefa.markAsDeleted();
            }
            projeto.markAsDeleted();
            projetoRepository.save(projeto);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional(readOnly = true)
    public List<ProjetoWithUsersAndTarefasDTO> searchProjetos(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<Projeto> projetos = projetoRepository.findByDesignacaoLikeIgnoreCaseOrEntidadeLikeIgnoreCase(searchQuery, searchQuery);
        List<ProjetoWithUsersAndTarefasDTO> list = new ArrayList<>();
        for (Projeto projeto : projetos) {
            ProjetoWithUsersAndTarefasDTO projetoWithUsersAndTarefasDTO = new ProjetoWithUsersAndTarefasDTO(projeto);
            list.add(projetoWithUsersAndTarefasDTO);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Projeto findByIdForDelete(Long id) {
        Optional<Projeto> obj = projetoRepository.findById(id);
        return obj.orElseThrow(() -> new ResourceNotFoundException("Entity not found"));
    }

    @Transactional(readOnly = true)
    public List<ProjetoWithUsersDTO> findAll() {
        List<ProjetoWithUsersDTO> list = new ArrayList<>();
        for (Projeto projeto : projetoRepository.findAllActive()) {
            ProjetoWithUsersDTO projetoWithUsersDTO = new ProjetoWithUsersDTO(projeto, projeto.getUsers());
            list.add(projetoWithUsersDTO);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Page<ProjetoWithUsersDTO> filterProjetos(
            String designacao,
            String entidade,
            String prioridade,
            Date startDate,
            Date endDate,
            String status,
            Long coordenadorId,
            Date propostaStartDate,
            Date propostaEndDate,
            Date adjudicacaoStartDate,
            Date adjudicacaoEndDate,
            Pageable pageable) {

        // Adjust end dates to be inclusive
        Date adjustedEndDate = adjustEndDate(endDate);
        Date adjustedPropostaEndDate = adjustEndDate(propostaEndDate);
        Date adjustedAdjudicacaoEndDate = adjustEndDate(adjudicacaoEndDate);

        // Only pass status if it's not "ALL"
        String statusFilter = (status != null && !status.equals("ALL")) ? status : null;

        Page<Projeto> result = projetoRepository.findByFilters(
                designacao, entidade, prioridade, startDate, adjustedEndDate, statusFilter,
                coordenadorId, propostaStartDate, adjustedPropostaEndDate,
                adjudicacaoStartDate, adjustedAdjudicacaoEndDate, pageable);

        return result.map(projeto -> new ProjetoWithUsersDTO(projeto, projeto.getUsers()));
    }

    private Date adjustEndDate(Date endDate) {
        if (endDate == null) return null;
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(endDate);
        calendar.add(Calendar.DATE, 1);
        return calendar.getTime();
    }

    @Transactional(readOnly = true)
    public List<ProjetoWithUsersDTO> findByCoordenador(Long coordenadorId) {
        List<ProjetoWithUsersDTO> list = new ArrayList<>();
        for (Projeto projeto : projetoRepository.findByCoordenadorId(coordenadorId)) {
            ProjetoWithUsersDTO projetoWithUsersDTO = new ProjetoWithUsersDTO(projeto, projeto.getUsers());
            list.add(projetoWithUsersDTO);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<ExternoDTO> findExternosByProjetoId(Long projetoId) {
        try {
            List<Externo> externos = projetoRepository.findExternosByProjetoId(projetoId);
            List<ExternoDTO> list = new ArrayList<>();
            for (Externo externo : externos) {
                ExternoDTO externoDTO = new ExternoDTO(externo);
                list.add(externoDTO);
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    /**
     * Check if a project is NOT assigned to a specific user or is deleted
     */
    @Transactional(readOnly = true)
    public boolean shouldDenyProjectAccess(Long projectId, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            return true;  // Deny access if user not found
        }

        // Find all projects for this user
        Set<Projeto> userProjetos = user.getProjetos();

        // Return true to deny access if the project is not in user's projects or is deleted
        return userProjetos.stream()
                .noneMatch(projeto -> projeto.getId().equals(projectId) && !projeto.isDeleted());
    }

    /**
     * Find projects by user email (for users who can only view assigned projects)
     */
    @Transactional(readOnly = true)
    public Page<ProjetoWithUsersDTO> findProjectsByUserEmail(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + email);
        }

        // Get all projects for this user
        List<Projeto> userProjects = new ArrayList<>(user.getProjetos());

        // IMPORTANT: Filter out deleted projects
        List<Projeto> list = new ArrayList<>();
        for (Projeto userProject : userProjects) {
            if (!userProject.isDeleted()) {
                list.add(userProject);
            }
        }
        userProjects = list;

        // Apply pagination manually (since we fetched from user entity)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), userProjects.size());

        List<Projeto> pagedProjects = (start <= end)
                ? userProjects.subList(start, end)
                : Collections.emptyList();

        // Convert to DTOs
        List<ProjetoWithUsersDTO> dtos = new ArrayList<>();
        for (Projeto projeto : pagedProjects) {
            ProjetoWithUsersDTO projetoWithUsersDTO = new ProjetoWithUsersDTO(projeto, projeto.getUsers());
            dtos.add(projetoWithUsersDTO);
        }

        return new PageImpl<>(dtos, pageable, userProjects.size());
    }

    /**
     * Search projects for a specific user
     */
    @Transactional(readOnly = true)
    public List<ProjetoWithUsersAndTarefasDTO> searchProjetosForUser(String query, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + userEmail);
        }

        String searchQuery = "%" + query.toLowerCase() + "%";

        // Get all projects for this user that match the search query
        List<Projeto> userProjects = user.getProjetos().stream()
                .filter(projeto -> !projeto.isDeleted())
                .filter(projeto ->
                        projeto.getDesignacao().toLowerCase().contains(query.toLowerCase()) ||
                                projeto.getEntidade().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        return userProjects.stream()
                .map(ProjetoWithUsersAndTarefasDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Filter projects for a specific user
     */
    @Transactional(readOnly = true)
    public Page<ProjetoWithUsersDTO> filterProjetosForUser(
            String designacao,
            String entidade,
            String prioridade,
            Date startDate,
            Date endDate,
            String status,
            Long coordenadorId,
            Date propostaStartDate,
            Date propostaEndDate,
            Date adjudicacaoStartDate,
            Date adjudicacaoEndDate,
            String userEmail,
            Pageable pageable) {

        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with email: " + userEmail);
        }

        // Get all projects for this user
        Set<Projeto> userProjects = user.getProjetos();

        // Adjust end dates to be inclusive
        Date adjustedEndDate = adjustEndDate(endDate);
        Date adjustedPropostaEndDate = adjustEndDate(propostaEndDate);
        Date adjustedAdjudicacaoEndDate = adjustEndDate(adjudicacaoEndDate);

        // Only pass status if it's not "ALL"
        String statusFilter = (status != null && !status.equals("ALL")) ? status : null;

        // Filter the user's projects manually
        List<Projeto> filteredProjects = userProjects.stream()
                .filter(projeto -> !projeto.isDeleted()) // Use isDeleted() method
                .filter(projeto ->
                        (designacao == null || projeto.getDesignacao().toLowerCase().contains(designacao.toLowerCase())) &&
                                (entidade == null || projeto.getEntidade().toLowerCase().contains(entidade.toLowerCase())) &&
                                (prioridade == null || projeto.getPrioridade().equals(prioridade)) &&
                                (statusFilter == null || projeto.getStatus().equals(statusFilter)) &&
                                (startDate == null || projeto.getDataAdjudicacao() == null || !projeto.getDataAdjudicacao().before(startDate)) &&
                                (adjustedEndDate == null || projeto.getDataProposta() == null || !projeto.getDataProposta().after(adjustedEndDate)) &&
                                (coordenadorId == null || (projeto.getCoordenador() != null && projeto.getCoordenador().getId().equals(coordenadorId))) &&
                                (propostaStartDate == null || projeto.getDataProposta() == null || !projeto.getDataProposta().before(propostaStartDate)) &&
                                (adjustedPropostaEndDate == null || projeto.getDataProposta() == null || !projeto.getDataProposta().after(adjustedPropostaEndDate)) &&
                                (adjudicacaoStartDate == null || projeto.getDataAdjudicacao() == null || !projeto.getDataAdjudicacao().before(adjudicacaoStartDate)) &&
                                (adjustedAdjudicacaoEndDate == null || projeto.getDataAdjudicacao() == null || !projeto.getDataAdjudicacao().after(adjustedAdjudicacaoEndDate))
                )
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredProjects.size());

        List<Projeto> pagedProjects = (start <= end)
                ? filteredProjects.subList(start, end)
                : Collections.emptyList();

        // Convert to DTOs
        List<ProjetoWithUsersDTO> dtos = pagedProjects.stream()
                .map(projeto -> new ProjetoWithUsersDTO(projeto, projeto.getUsers()))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, filteredProjects.size());
    }

}
