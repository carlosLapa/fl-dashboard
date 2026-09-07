package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoUserHistoryTimelineDTO;
import com.fl.dashboard.services.ProjetoUserHistoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes a collaborator's project-assignment history (when they were added
 * to / removed from projects). This is a performance-evaluation tool for
 * management, not a self-service page - readable only by VIEW_REPORTS,
 * deliberately with no self-access exception for the collaborator being
 * evaluated.
 */
@RestController
@RequestMapping(value = "/users/{id}/projeto-history")
public class ProjetoUserHistoryResource {

    private final ProjetoUserHistoryService projetoUserHistoryService;

    public ProjetoUserHistoryResource(ProjetoUserHistoryService projetoUserHistoryService) {
        this.projetoUserHistoryService = projetoUserHistoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS')")
    public ResponseEntity<ProjetoUserHistoryTimelineDTO> getHistorico(@PathVariable Long id) {
        return ResponseEntity.ok(projetoUserHistoryService.getHistoricoParaUser(id));
    }
}
