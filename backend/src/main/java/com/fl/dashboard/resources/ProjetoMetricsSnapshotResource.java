package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoMetricsSnapshotDTO;
import com.fl.dashboard.services.ProjetoMetricsService;
import com.fl.dashboard.services.ProjetoMetricsSnapshotService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for project metrics history (snapshots).
 * Kept separate from ProjetoMetricsResource so that one stays focused on the
 * current, live-calculated state.
 * <p>
 * Access control mirrors ProjetoMetricsResource: same VIEW_ALL_PROJECTS /
 * project-assignment check for both reading and creating snapshots - anyone
 * who can see a project's live metrics can also capture a point-in-time copy
 * of them.
 */
@RestController
@RequestMapping(value = "/projetos/{id}/metrics/snapshots")
public class ProjetoMetricsSnapshotResource {

    private final ProjetoMetricsSnapshotService projetoMetricsSnapshotService;
    private final ProjetoMetricsService projetoMetricsService;

    public ProjetoMetricsSnapshotResource(
            ProjetoMetricsSnapshotService projetoMetricsSnapshotService,
            ProjetoMetricsService projetoMetricsService) {
        this.projetoMetricsSnapshotService = projetoMetricsSnapshotService;
        this.projetoMetricsService = projetoMetricsService;
    }

    @PostMapping
    public ResponseEntity<ProjetoMetricsSnapshotDTO> criarSnapshot(
            @PathVariable Long id,
            Authentication authentication) {

        if (accessDenied(id, authentication)) {
            return ResponseEntity.status(403).build();
        }

        try {
            String userEmail = extractUserEmail(authentication);
            ProjetoMetricsSnapshotDTO snapshot = projetoMetricsSnapshotService.criarSnapshot(id, userEmail);
            return ResponseEntity.status(201).body(snapshot);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ProjetoMetricsSnapshotDTO>> listarSnapshots(
            @PathVariable Long id,
            Authentication authentication) {

        if (accessDenied(id, authentication)) {
            return ResponseEntity.status(403).build();
        }

        List<ProjetoMetricsSnapshotDTO> snapshots = projetoMetricsSnapshotService.listarSnapshots(id);
        return ResponseEntity.ok(snapshots);
    }

    private boolean accessDenied(Long projetoId, Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

        if (canViewAll) {
            return false;
        }

        String userEmail = extractUserEmail(authentication);
        return projetoMetricsService.shouldDenyMetricsAccess(projetoId, userEmail);
    }

    private String extractUserEmail(Authentication authentication) {
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaim("email");
        }
        return authentication.getName();
    }
}
