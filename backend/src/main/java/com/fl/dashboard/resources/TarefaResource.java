package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.enums.TarefaStatus;
import com.fl.dashboard.services.TarefaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping(value = "/tarefas")
public class TarefaResource {

    @Autowired
    private TarefaService tarefaService;

    // Helper method to extract email from Authentication
    private String extractUserEmail(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            return jwt.getClaim("email");
        }
        return authentication != null ? authentication.getName() : null;
    }

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> findAll(Authentication authentication) {
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        if (canViewAll) {
            List<TarefaDTO> list = tarefaService.findAll();
            return ResponseEntity.ok().body(list);
        } else {
            String userEmail = extractUserEmail(authentication);
            List<TarefaDTO> list = tarefaService.findAllAssignedToUser(userEmail);
            return ResponseEntity.ok().body(list);
        }
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TarefaDTO> findById(@PathVariable Long id, Authentication authentication) {
        // Permission check: only assigned users or privileged roles can view
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        if (!canViewAll) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(id, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        TarefaDTO tarefaDTO = tarefaService.findById(id);
        return ResponseEntity.ok().body(tarefaDTO);
    }

    @GetMapping("/{id}/with-users")
    public ResponseEntity<TarefaWithUsersDTO> findByIdWithUsers(@PathVariable Long id, Authentication authentication) {
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        if (!canViewAll) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(id, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        TarefaWithUsersDTO dto = tarefaService.findByIdWithUsers(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{id}/with-projeto")
    public ResponseEntity<TarefaWithProjetoDTO> findByIdWithProjeto(@PathVariable Long id, Authentication authentication) {
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        if (!canViewAll) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(id, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        TarefaWithProjetoDTO dto = tarefaService.findByIdWithProjeto(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<TarefaWithUserAndProjetoDTO> findByIdWithUsersAndProjeto(@PathVariable Long id, Authentication authentication) {
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        if (!canViewAll) {
            String userEmail = extractUserEmail(authentication);
            if (tarefaService.shouldDenyTaskAccess(id, userEmail)) {
                return ResponseEntity.status(403).build();
            }
        }
        TarefaWithUserAndProjetoDTO dto = tarefaService.findByIdWithUsersAndProjeto(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/full")
    public ResponseEntity<List<TarefaWithUserAndProjetoDTO>> findAllWithUsersAndProjeto() {
        List<TarefaWithUserAndProjetoDTO> dtos = tarefaService.findAllWithUsersAndProjeto();
        return ResponseEntity.ok().body(dtos);
    }

    @PostMapping("/with-associations")
    public ResponseEntity<TarefaWithUserAndProjetoDTO> insertWithAssociations(@Valid @RequestBody TarefaInsertDTO dto) {
        TarefaWithUserAndProjetoDTO result = tarefaService.insertWithAssociations(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.getId()).toUri();
        return ResponseEntity.created(uri).body(result);
    }

    // Verificar se será necessário manter os 4 seguintes métodos abaixo
    @PostMapping
    public ResponseEntity<TarefaDTO> insert(@Valid @RequestBody TarefaDTO tarefaDTO) {
        tarefaDTO = tarefaService.insert(tarefaDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(tarefaDTO.getId()).toUri();
        return ResponseEntity.created(uri).body(tarefaDTO);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<TarefaDTO> update(@PathVariable Long id, @Valid @RequestBody TarefaDTO dto) {
        TarefaDTO newDto = tarefaService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @PutMapping("/{id}/users")
    public ResponseEntity<Void> updateTarefaUsers(@PathVariable Long id, @RequestBody Set<Long> userIds) {
        tarefaService.updateTarefaUsers(id, userIds);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/projeto")
    public ResponseEntity<Void> updateTarefaProjeto(@PathVariable Long id, @RequestBody Long projetoId) {
        tarefaService.updateTarefaProjeto(id, projetoId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/with-associations/{id}")
    public ResponseEntity<TarefaWithUserAndProjetoDTO> updateWithAssociations(
            @PathVariable Long id,
            @Valid @RequestBody TarefaUpdateDTO dto) {
        if (!id.equals(dto.getId())) {
            throw new IllegalArgumentException("ID in path does not match ID in body");
        }
        TarefaWithUserAndProjetoDTO result = tarefaService.updateWithAssociations(dto);
        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tarefaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TarefaDTO> updateStatus(@PathVariable Long id, @RequestBody TarefaStatusUpdateDTO statusDTO) {
        TarefaDTO updatedTarefa = tarefaService.updateStatus(id, statusDTO.getStatus());
        return ResponseEntity.ok().body(updatedTarefa);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TarefaWithUserAndProjetoDTO>> searchTarefas(@RequestParam String query) {
        List<TarefaWithUserAndProjetoDTO> results = tarefaService.searchTarefas(query);
        return ResponseEntity.ok().body(results);
    }

    // Keeping this endpoint for backward compatibility but marked as deprecated - since V2 migration
    @Deprecated
    @GetMapping("/user/{userId}/tasks")
    public ResponseEntity<List<TarefaWithUserAndProjetoDTO>> getAllUserTasks(@PathVariable Long userId) {
        List<TarefaWithUserAndProjetoDTO> tasks = tarefaService.findAllActiveByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    // new endpoint for paginated access
    @GetMapping("/user/{userId}/full")
    public ResponseEntity<Page<TarefaWithUserAndProjetoDTO>> getAllUserTasksPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        System.out.println("getAllUserTasksPaginated called for userId: " + userId + ", page: " + page + ", size: " + size);
        Page<TarefaWithUserAndProjetoDTO> taskPage = tarefaService.findAllActiveByUserIdPaginated(userId, page, size);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.SECONDS))
                .body(taskPage);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<TarefaWithUserAndProjetoDTO>> findByDateRange(
            @RequestParam String dateField,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(endDate);
        calendar.add(Calendar.DATE, 1);
        Date adjustedEndDate = calendar.getTime();
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        String userEmail = extractUserEmail(authentication);
        Page<TarefaWithUserAndProjetoDTO> result = tarefaService.findByDateRange(
                dateField, startDate, adjustedEndDate, page, size, userEmail, canViewAll);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/sorted")
    public ResponseEntity<Page<TarefaWithUserAndProjetoDTO>> findAllSorted(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        String userEmail = extractUserEmail(authentication);
        Page<TarefaWithUserAndProjetoDTO> result = tarefaService.findAllSorted(
                sort, direction, page, size, userEmail, canViewAll);
        return ResponseEntity.ok().body(result);
    }

    // New endpoints for working days functionality

    /**
     * Recalculate working days for a specific tarefa
     */
    @PostMapping("/{id}/recalculate-working-days")
    public ResponseEntity<Void> recalculateWorkingDays(@PathVariable Long id) {
        tarefaService.recalculateWorkingDays(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update working days for a specific tarefa
     */
    @PutMapping("/{id}/working-days")
    public ResponseEntity<TarefaDTO> updateWorkingDays(
            @PathVariable Long id,
            @RequestBody Integer workingDays) {
        TarefaDTO updatedTarefa = tarefaService.updateWorkingDays(id, workingDays);
        return ResponseEntity.ok().body(updatedTarefa);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<TarefaWithUserAndProjetoDTO>> filterTarefas(
            @RequestParam(required = false) String descricao,
            @RequestParam(required = false) TarefaStatus status,
            @RequestParam(required = false) Long projetoId,
            @RequestParam(required = false) String dateField,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        TarefaFilterDTO filterDTO = new TarefaFilterDTO();
        filterDTO.setDescricao(descricao);
        filterDTO.setStatus(status);
        filterDTO.setProjetoId(projetoId);
        filterDTO.setDateField(dateField);
        filterDTO.setStartDate(startDate);
        filterDTO.setEndDate(endDate);

        boolean canViewAll = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("VIEW_ALL_TASKS"));
        String userEmail = extractUserEmail(authentication);
        Page<TarefaWithUserAndProjetoDTO> result = tarefaService.findWithFilters(
                filterDTO, page, size, sort, direction, userEmail, canViewAll);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.SECONDS))
                .body(result);
    }


}
