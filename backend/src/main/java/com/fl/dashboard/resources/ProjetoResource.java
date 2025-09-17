package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.enums.TipoProjeto;
import com.fl.dashboard.services.NotificationService;
import com.fl.dashboard.services.ProjetoService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
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
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            Page<ProjetoWithUsersDTO> list = projetoService.findAllPaged(pageable);
            return ResponseEntity.ok().body(list);
        } else {
            String userEmail;
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
        try {
            boolean canViewAll = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

            if (!canViewAll) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            ProjetoDTO projetoDTO = projetoService.findByIdWithUsers(id);
            return ResponseEntity.ok().body(projetoDTO);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/with-tarefas")
    public ResponseEntity<ProjetoWithTarefasDTO> getProjetoWithTarefas(@PathVariable Long id, Authentication authentication) {
        try {
            boolean canViewAll = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

            if (!canViewAll) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            ProjetoWithTarefasDTO projeto = projetoService.findProjetoWithTarefas(id);
            return ResponseEntity.ok(projeto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<ProjetoWithUsersAndTarefasDTO> getProjetoWithUsersAndTarefas(@PathVariable Long id, Authentication authentication) {
        try {
            boolean canViewAll = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

            if (!canViewAll) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            ProjetoWithUsersAndTarefasDTO projeto = projetoService.findProjetoWithUsersAndTarefas(id);
            return ResponseEntity.ok(projeto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PROJECT')")
    public ResponseEntity<ProjetoWithUsersDTO> insert(@Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO savedDto = projetoService.insert(dto);

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
        try {
            ProjetoWithUsersDTO newDto = projetoService.update(id, dto);

            newDto.getUsers().forEach(user ->
                    notificationService.createProjectNotification(
                            projetoService.findByIdWithUsers(newDto.getId()),
                            NotificationType.PROJETO_ATUALIZADO,
                            user
                    )
            );

            return ResponseEntity.ok().body(newDto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoDTO> updateBasicInfo(@PathVariable Long id, @Valid @RequestBody ProjetoDTO dto) {
        try {
            ProjetoDTO newDto = projetoService.updateBasicInfo(id, dto);
            return ResponseEntity.ok().body(newDto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('DELETE_PROJECT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            projetoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProjetos(@RequestParam String query, Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            List<ProjetoWithUsersAndTarefasDTO> results = projetoService.searchProjetos(query);
            return ResponseEntity.ok().body(results);
        } else {
            String userEmail;
            if (authentication.getPrincipal() instanceof Jwt jwt) {
                userEmail = jwt.getClaim("email");
            } else {
                userEmail = authentication.getName();
            }
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
        try {
            ProjetoWithUsersDTO updatedProjeto = projetoService.updateStatus(id, status);
            return ResponseEntity.ok().body(updatedProjeto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
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
            Page<ProjetoWithUsersDTO> result = projetoService.filterProjetos(
                    designacao, entidade, prioridade, startDate, endDate, status,
                    coordenadorId, propostaStartDate, propostaEndDate,
                    adjudicacaoStartDate, adjudicacaoEndDate, pageable);
            return ResponseEntity.ok().body(result);
        } else {
            String userEmail;
            if (authentication.getPrincipal() instanceof Jwt jwt) {
                userEmail = jwt.getClaim("email");
            } else {
                userEmail = authentication.getName();
            }
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
        try {
            boolean canViewAll = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

            if (!canViewAll) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            List<ExternoDTO> externos = projetoService.findExternosByProjetoId(id);
            return ResponseEntity.ok(externos);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/externos")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoDTO> addExternosToProjeto(
            @PathVariable Long id,
            @RequestBody List<Long> externoIds,
            Authentication authentication) {
        try {
            boolean canEdit = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("EDIT_PROJECT"));

            if (!canEdit) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            Projeto projeto = projetoService.addExternosToProjeto(id, externoIds);
            return ResponseEntity.ok().body(new ProjetoDTO(projeto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{projetoId}/externos/{externoId}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoDTO> removeExternoFromProjeto(
            @PathVariable Long projetoId,
            @PathVariable Long externoId,
            Authentication authentication) {
        try {
            boolean canEdit = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("EDIT_PROJECT"));

            if (!canEdit) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }
                if (projetoService.shouldDenyProjectAccess(projetoId, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            Projeto projeto = projetoService.removeExternoFromProjeto(projetoId, externoId);
            return ResponseEntity.ok().body(new ProjetoDTO(projeto));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/filter-by-tipo")
    public ResponseEntity<Page<ProjetoWithUsersDTO>> filterByTipo(
            @RequestParam(required = false) TipoProjeto tipo,
            Pageable pageable,
            Authentication authentication) {

        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            Page<ProjetoWithUsersDTO> result = projetoService.filterProjetosByTipo(tipo, pageable);
            return ResponseEntity.ok().body(result);
        } else {
            // Se for necessário filtrar só pelos projetos do utilizador, podemos adaptar aqui.
            return ResponseEntity.status(403).build();
        }
    }


}