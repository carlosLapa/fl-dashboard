package com.fl.dashboard.resources;

import com.fl.dashboard.dto.CollaboratorGlobalMetricsDTO;
import com.fl.dashboard.services.ColaboradorReportService;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * REST controller for cross-project collaborator reports.
 * Unlike ProjetoMetricsResource (scoped to a single project a user may be
 * assigned to), this is always an organization-wide report, so access is
 * gated purely by the VIEW_REPORTS permission - no per-project ownership check.
 */
@RestController
@RequestMapping(value = "/relatorios/colaboradores")
public class ColaboradorReportResource {

    private final ColaboradorReportService colaboradorReportService;

    public ColaboradorReportResource(ColaboradorReportService colaboradorReportService) {
        this.colaboradorReportService = colaboradorReportService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_REPORTS')")
    public ResponseEntity<List<CollaboratorGlobalMetricsDTO>> getGlobalCollaboratorMetrics() {
        List<CollaboratorGlobalMetricsDTO> metrics =
                colaboradorReportService.getGlobalCollaboratorMetrics();

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS))
                .body(metrics);
    }
}
