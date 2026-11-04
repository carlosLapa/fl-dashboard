package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoFaseDTO;
import com.fl.dashboard.services.ProjetoFaseService;
import com.fl.dashboard.services.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

// Phases of a projeto, for its Gantt timeline. Reading follows the same rule as GET /projetos/{id}
// (VIEW_ALL_PROJECTS, or being on the projeto); writing needs EDIT_PROJECT.
// Provisional: who may manage phases is still being decided with the team.
@RestController
@RequestMapping(value = "/projetos/{projetoId}/fases")
public class ProjetoFaseResource {

    private final ProjetoFaseService faseService;
    private final ProjetoService projetoService;

    public ProjetoFaseResource(ProjetoFaseService faseService, ProjetoService projetoService) {
        this.faseService = faseService;
        this.projetoService = projetoService;
    }

    @GetMapping
    public ResponseEntity<List<ProjetoFaseDTO>> findByProjeto(@PathVariable Long projetoId, Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));
        if (!canViewAll) {
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
        return ResponseEntity.ok(faseService.findByProjeto(projetoId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoFaseDTO> insert(@PathVariable Long projetoId, @Valid @RequestBody ProjetoFaseDTO dto) {
        ProjetoFaseDTO created = faseService.insert(projetoId, dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{faseId}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<ProjetoFaseDTO> update(@PathVariable Long projetoId, @PathVariable Long faseId,
                                                 @Valid @RequestBody ProjetoFaseDTO dto) {
        return ResponseEntity.ok(faseService.update(projetoId, faseId, dto));
    }

    @DeleteMapping("/{faseId}")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<Void> delete(@PathVariable Long projetoId, @PathVariable Long faseId) {
        faseService.delete(projetoId, faseId);
        return ResponseEntity.noContent().build();
    }

    // Body: every phase id of the projeto, in the new order.
    @PutMapping("/ordem")
    @PreAuthorize("hasAuthority('EDIT_PROJECT')")
    public ResponseEntity<List<ProjetoFaseDTO>> reordenar(@PathVariable Long projetoId, @RequestBody List<Long> faseIds) {
        return ResponseEntity.ok(faseService.reordenar(projetoId, faseIds));
    }
}
