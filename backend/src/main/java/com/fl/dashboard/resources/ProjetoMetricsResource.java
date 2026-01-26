package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoMetricsDTO;
import com.fl.dashboard.services.ProjetoMetricsService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
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
     * GET /projetos/{id}/metrics
     * Returns comprehensive metrics for a specific project
     * <p>
     * Access control:
     * - Users with VIEW_ALL_PROJECTS can view any project metrics
     * - Other users can only view metrics for projects they are assigned to
     * - Service layer handles additional project assignment verification
     *
     * @param id             Project ID
     * @param authentication Spring Security authentication object
     * @return ProjetoMetricsDTO with all calculated metrics
     */
    @GetMapping("/{id}/metrics")
    public ResponseEntity<ProjetoMetricsDTO> getProjetoMetrics(
            @PathVariable Long id,
            Authentication authentication) {

        try {
            // Check if user has VIEW_ALL_PROJECTS permission
            boolean canViewAll = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_PROJECTS"));

            // If user doesn't have VIEW_ALL_PROJECTS, check project assignment
            if (!canViewAll) {
                String userEmail;
                if (authentication.getPrincipal() instanceof Jwt jwt) {
                    userEmail = jwt.getClaim("email");
                } else {
                    userEmail = authentication.getName();
                }

                // Delegate access check to service layer (reuses existing logic)
                if (projetoMetricsService.shouldDenyMetricsAccess(id, userEmail)) {
                    return ResponseEntity.status(403).build();
                }
            }

            // Fetch and return metrics
            ProjetoMetricsDTO metrics = projetoMetricsService.getProjetoMetrics(id);

            // Cache metrics for 30 seconds to reduce load on repeated requests
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS))
                    .body(metrics);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            // Handle unexpected runtime exceptions
            if (e.getMessage() != null && e.getMessage().contains("Acesso negado")) {
                return ResponseEntity.status(403).build();
            }
            // Re-throw other exceptions for global error handler
            throw e;
        }
    }
}