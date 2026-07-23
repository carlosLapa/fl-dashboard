package com.fl.dashboard.resources;

import com.fl.dashboard.dto.SubtarefaDTO;
import com.fl.dashboard.dto.SubtarefaDivisaoItemDTO;
import com.fl.dashboard.dto.SubtarefaUpdateDTO;
import com.fl.dashboard.services.SubtarefaService;
import com.fl.dashboard.services.TarefaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/tarefas/{tarefaId}/subtarefas")
public class SubtarefaResource {

    private final SubtarefaService subtarefaService;
    private final TarefaService tarefaService;

    public SubtarefaResource(SubtarefaService subtarefaService, TarefaService tarefaService) {
        this.subtarefaService = subtarefaService;
        this.tarefaService = tarefaService;
    }

    // Helper method to extract email from Authentication
    private String extractUserEmail(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            return jwt.getClaim("email");
        }
        return authentication != null ? authentication.getName() : null;
    }

    private boolean canViewAll(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
    }

    @GetMapping
    public ResponseEntity<List<SubtarefaDTO>> findByTarefaId(@PathVariable Long tarefaId, Authentication authentication) {
        if (!canViewAll(authentication)) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(tarefaId, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(subtarefaService.findByTarefaId(tarefaId));
    }

    @PostMapping("/dividir")
    public ResponseEntity<List<SubtarefaDTO>> dividirEmSubtarefas(
            @PathVariable Long tarefaId,
            @RequestBody(required = false) List<SubtarefaDivisaoItemDTO> itens,
            Authentication authentication) {
        if (!canViewAll(authentication)) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(tarefaId, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(subtarefaService.dividirEmSubtarefas(tarefaId, itens));
    }

    @DeleteMapping
    public ResponseEntity<Void> desfazerDivisao(@PathVariable Long tarefaId, Authentication authentication) {
        if (!canViewAll(authentication)) {
            return ResponseEntity.status(403).build();
        }
        subtarefaService.desfazerDivisao(tarefaId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{subtarefaId}")
    public ResponseEntity<SubtarefaDTO> updateSubtarefa(
            @PathVariable Long tarefaId,
            @PathVariable Long subtarefaId,
            @RequestBody SubtarefaUpdateDTO dto,
            Authentication authentication) {
        if (!canViewAll(authentication)) {
            String userEmail = extractUserEmail(authentication);
            if (!subtarefaService.isOwnerOfSubtarefa(tarefaId, subtarefaId, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(subtarefaService.updateSubtarefa(tarefaId, subtarefaId, dto.getDescricao()));
    }

    @PutMapping("/{subtarefaId}/concluir")
    public ResponseEntity<SubtarefaDTO> concluirSubtarefa(
            @PathVariable Long tarefaId,
            @PathVariable Long subtarefaId,
            Authentication authentication) {
        String userEmail = extractUserEmail(authentication);
        if (!subtarefaService.isOwnerOfSubtarefa(tarefaId, subtarefaId, userEmail)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(subtarefaService.concluirSubtarefa(tarefaId, subtarefaId));
    }

    @PutMapping("/{subtarefaId}/reabrir")
    public ResponseEntity<SubtarefaDTO> reabrirSubtarefa(
            @PathVariable Long tarefaId,
            @PathVariable Long subtarefaId,
            Authentication authentication) {
        String userEmail = extractUserEmail(authentication);
        if (!subtarefaService.isOwnerOfSubtarefa(tarefaId, subtarefaId, userEmail)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(subtarefaService.reabrirSubtarefa(tarefaId, subtarefaId));
    }

}
