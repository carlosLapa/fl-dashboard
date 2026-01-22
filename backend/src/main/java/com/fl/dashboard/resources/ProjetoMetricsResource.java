package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoMetricsDTO;
import com.fl.dashboard.services.ProjetoMetricsService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoMetricsResource {

    private final ProjetoMetricsService projetoMetricsService;

    public ProjetoMetricsResource(ProjetoMetricsService projetoMetricsService) {
        this.projetoMetricsService = projetoMetricsService;
    }

    /**
     * Get comprehensive metrics for a specific project
     * <p>
     * Access control:
     * - Requires VIEW_ALL_PROJECTS permission (Admin/Manager roles)
     * - Service layer handles additional project assignment verification
     *
     * @param id Project ID
     * @return ProjetoMetricsDTO with all calculated metrics
     */
    @GetMapping("/{id}/metrics")
    @PreAuthorize("hasAuthority('VIEW_ALL_PROJECTS')")
    public ResponseEntity<ProjetoMetricsDTO> getProjetoMetrics(@PathVariable Long id) {
        try {
            ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(id);

            // Cache metrics for 30 seconds to reduce load on repeated requests
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS))
                    .body(metrics);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            // Handle "Acesso negado ao projeto" exception - implement customized response
            if (e.getMessage().contains("Acesso negado")) {
                return ResponseEntity.status(403).build();
            }
            // Re-throw other runtime exceptions
            throw e;
        }
    }
}