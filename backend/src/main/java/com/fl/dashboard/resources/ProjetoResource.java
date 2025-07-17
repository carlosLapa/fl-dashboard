package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.services.NotificationService;
import com.fl.dashboard.services.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoResource {

    @Autowired
    private ProjetoService projetoService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<ProjetoWithUsersDTO>> findAll(Pageable pageable, Authentication authentication) {
        // Check permissions and return different results based on user's role
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            // User can view all projects
            Page<ProjetoWithUsersDTO> list = projetoService.findAllPaged(pageable);
            return ResponseEntity.ok().body(list);
        } else {
            // User can only view assigned projects
            // Get the actual email from the token claims, not from authentication.getName()
            String userEmail;

            // Using pattern matching for instanceof (Java 16+)
            if (authentication.getPrincipal() instanceof Jwt jwt) {
                userEmail = jwt.getClaim("email");
            } else {
                userEmail = authentication.getName();
            }

            Page<ProjetoWithUsersDTO> list = projetoService.findProjectsByUserEmail(userEmail, pageable);
            return ResponseEntity.ok().body(list);
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> findById(@PathVariable Long id, Authentication authentication) {
        // Check if user has permission to view this project
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (!canViewAll) {
            // Check if project is assigned to user
            String userEmail = authentication.getName();
            if (!projetoService.isProjectAssignedToUser(id, userEmail)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        ProjetoDTO projetoDTO = projetoService.findByIdWithUsers(id);
        return ResponseEntity.ok().body(projetoDTO);
    }

    @GetMapping("/{id}/with-tarefas")
    public ResponseEntity<ProjetoWithTarefasDTO> getProjetoWithTarefas(@PathVariable Long id, Authentication authentication) {
        // Check if user has permission to view this project
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (!canViewAll) {
            // Check if project is assigned to user
            String userEmail = authentication.getName();
            if (!projetoService.isProjectAssignedToUser(id, userEmail)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        ProjetoWithTarefasDTO projeto = projetoService.findProjetoWithTarefas(id);
        return ResponseEntity.ok(projeto);
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<ProjetoWithUsersAndTarefasDTO> getProjetoWithUsersAndTarefas(@PathVariable Long id, Authentication authentication) {
        // Check if user has permission to view this project
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (!canViewAll) {
            // Check if project is assigned to user
            String userEmail = authentication.getName();
            if (!projetoService.isProjectAssignedToUser(id, userEmail)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        ProjetoWithUsersAndTarefasDTO projeto = projetoService.findProjetoWithUsersAndTarefas(id);
        return ResponseEntity.ok(projeto);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PROJECT')")
    public ResponseEntity<ProjetoWithUsersDTO> insert(@Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO savedDto = projetoService.insert(dto);

        // Send notifications to all assigned users
        savedDto.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        projetoService.findByIdWithUsers(savedDto.getId()),
                        NotificationType.PROJETO_ATRIBUIDO,
                        user
                )
        );

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedDto.getId()).toUri();
        return ResponseEntity.created(uri).body(savedDto);
    }

    @PutMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoWithUsersDTO> update(@PathVariable Long id, @Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO newDto = projetoService.update(id, dto);

        // Send notifications to all assigned users
        newDto.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        projetoService.findByIdWithUsers(newDto.getId()),
                        NotificationType.PROJETO_ATUALIZADO,
                        user
                )
        );

        return ResponseEntity.ok().body(newDto);
    }

    @PatchMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoDTO> updateBasicInfo(@PathVariable Long id, @Valid @RequestBody ProjetoDTO dto) {
        ProjetoDTO newDto = projetoService.updateBasicInfo(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('DELETE_PROJECT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projetoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProjetos(@RequestParam String query, Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            // User can view all projects
            List<ProjetoWithUsersAndTarefasDTO> results = projetoService.searchProjetos(query);
            return ResponseEntity.ok().body(results);
        } else {
            // User can only view assigned projects
            String userEmail = authentication.getName();
            List<ProjetoWithUsersAndTarefasDTO> results = projetoService.searchProjetosForUser(query, userEmail);
            return ResponseEntity.ok().body(results);
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoWithUsersDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        ProjetoWithUsersDTO updatedProjeto = projetoService.updateStatus(id, status);
        return ResponseEntity.ok().body(updatedProjeto);
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterProjetos(
            @RequestParam(required = false) String designacao,
            @RequestParam(required = false) String entidade,
            @RequestParam(required = false) String prioridade,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long coordenadorId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date propostaStartDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date propostaEndDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date adjudicacaoStartDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date adjudicacaoEndDate,
            Pageable pageable,
            Authentication authentication) {

        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            // User can filter all projects
            Page<ProjetoWithUsersDTO> result = projetoService.filterProjetos(
                    designacao, entidade, prioridade, startDate, endDate, status,
                    coordenadorId, propostaStartDate, propostaEndDate,
                    adjudicacaoStartDate, adjudicacaoEndDate, pageable);
            return ResponseEntity.ok().body(result);
        } else {
            // User can only filter assigned projects
            String userEmail = authentication.getName();
            Page<ProjetoWithUsersDTO> result = projetoService.filterProjetosForUser(
                    designacao, entidade, prioridade, startDate, endDate, status,
                    coordenadorId, propostaStartDate, propostaEndDate,
                    adjudicacaoStartDate, adjudicacaoEndDate, userEmail, pageable);
            return ResponseEntity.ok().body(result);
        }
    }

    @GetMapping("/by-coordenador/{coordenadorId}")
    @PreAuthorize("hasAuthority('VIEW_ALL_PROJECTS') or #coordenadorId == authentication.principal.id")
    public ResponseEntity<List<ProjetoWithUsersDTO>> getProjetosByCoordenador(@PathVariable Long coordenadorId) {
        List<ProjetoWithUsersDTO> projetos = projetoService.findByCoordenador(coordenadorId);
        return ResponseEntity.ok(projetos);
    }

    @GetMapping("/{id}/externos")
    public ResponseEntity<List<ExternoDTO>> getExternosByProjetoId(@PathVariable Long id, Authentication authentication) {
        // Check if user has permission to view this project
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (!canViewAll) {
            // Check if project is assigned to user
            String userEmail = authentication.getName();
            if (!projetoService.isProjectAssignedToUser(id, userEmail)) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }

        try {
            List<ExternoDTO> externos = projetoService.findExternosByProjetoId(id);
            return ResponseEntity.ok(externos);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}