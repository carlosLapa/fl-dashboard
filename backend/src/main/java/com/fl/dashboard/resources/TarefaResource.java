package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.services.TarefaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> findAll() {
        List<TarefaDTO> list = tarefaService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<TarefaDTO> findById(@PathVariable Long id) {
        TarefaDTO tarefaDTO = tarefaService.findById(id);
        return ResponseEntity.ok().body(tarefaDTO);
    }

    @GetMapping("/{id}/with-users")
    public ResponseEntity<TarefaWithUsersDTO> findByIdWithUsers(@PathVariable Long id) {
        TarefaWithUsersDTO dto = tarefaService.findByIdWithUsers(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{id}/with-projeto")
    public ResponseEntity<TarefaWithProjetoDTO> findByIdWithProjeto(@PathVariable Long id) {
        TarefaWithProjetoDTO dto = tarefaService.findByIdWithProjeto(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<TarefaWithUserAndProjetoDTO> findByIdWithUsersAndProjeto(@PathVariable Long id) {
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
    ////

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

    // Keeping this endpoint for backward compatibility but marked as deprecated
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
            @RequestParam String dateField,  // Changed from 'field' to 'dateField'
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Add one day to endDate to make the range inclusive
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(endDate);
        calendar.add(Calendar.DATE, 1);
        Date adjustedEndDate = calendar.getTime();

        Page<TarefaWithUserAndProjetoDTO> result = tarefaService.findByDateRange(
                dateField, startDate, adjustedEndDate, page, size);  // Changed from 'field' to 'dateField'

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.SECONDS))
                .body(result);
    }

    @GetMapping("/sorted")
    public ResponseEntity<Page<TarefaWithUserAndProjetoDTO>> findAllSorted(
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "ASC") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<TarefaWithUserAndProjetoDTO> result = tarefaService.findAllSorted(
                sort, direction, page, size);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(10, TimeUnit.SECONDS))
                .body(result);
    }

}
