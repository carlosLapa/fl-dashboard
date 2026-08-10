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
 * to / removed from projects). Readable by anyone with VIEW_REPORTS
 * (management), or by the collaborator themselves about their own history -
 * same self-access pattern as UserResource#getTarefasByUser.
 */
@RestController
@RequestMapping(value = "/users/{id}/projeto-history")
public class ProjetoUserHistoryResource {

    private final ProjetoUserHistoryService projetoUserHistoryService;

    public ProjetoUserHistoryResource(ProjetoUserHistoryService projetoUserHistoryService) {
        this.projetoUserHistoryService = projetoUserHistoryService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#id).email")
    public ResponseEntity<ProjetoUserHistoryTimelineDTO> getHistorico(@PathVariable Long id) {
        return ResponseEntity.ok(projetoUserHistoryService.getHistoricoParaUser(id));
    }
}
