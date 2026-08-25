package com.fl.dashboard.resources;

import com.fl.dashboard.dto.TarefaUserDetalheDTO;
import com.fl.dashboard.services.ColaboradorReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes a collaborator's task detail (task, project, status, working days)
 * for the per-user report page. Distinct from UserResource#getTarefasByUser
 * (/users/{id}/tarefas), which returns the raw, unfiltered task list without
 * the project join or the deletedAt/arquivadaEm filtering used here.
 * Same self-access pattern as ProjetoUserHistoryResource.
 */
@RestController
@RequestMapping(value = "/users/{id}/tarefas-detalhe")
public class TarefaUserDetalheResource {

    private final ColaboradorReportService colaboradorReportService;

    public TarefaUserDetalheResource(ColaboradorReportService colaboradorReportService) {
        this.colaboradorReportService = colaboradorReportService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#id).email")
    public ResponseEntity<List<TarefaUserDetalheDTO>> getTarefaDetalhe(@PathVariable Long id) {
        return ResponseEntity.ok(colaboradorReportService.getTarefaDetailsForUser(id));
    }
}
