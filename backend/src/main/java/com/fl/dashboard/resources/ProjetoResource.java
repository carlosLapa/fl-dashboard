package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.dto.ProjetoWithTarefasDTO;
import com.fl.dashboard.dto.ProjetoWithUsersAndTarefasDTO;
import com.fl.dashboard.dto.ProjetoWithUsersDTO;
import com.fl.dashboard.enums.NotificationType;
import com.fl.dashboard.services.NotificationService;
import com.fl.dashboard.services.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoResource {

    @Autowired
    private ProjetoService projetoService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Page<ProjetoWithUsersDTO>> findAll(Pageable pageable) {
        Page<ProjetoWithUsersDTO> list = projetoService.findAllPaged(pageable);
        return ResponseEntity.ok().body(list);
    }

    /*
    @GetMapping("/with-users")
    public ResponseEntity<Page<ProjetoWithUsersDTO>> findAllWithUsers(Pageable pageable) {
        Page<ProjetoWithUsersDTO> list = projetoService.findAllPagedWithUsers(pageable);
        return ResponseEntity.ok().body(list);
    }
    */

    @GetMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> findById(@PathVariable Long id) {
        ProjetoDTO projetoDTO = projetoService.findByIdWithUsers(id);
        return ResponseEntity.ok().body(projetoDTO);
    }

    /*
    @GetMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> findById(@PathVariable Long id) {
        ProjetoDTO projetoDTO = projetoService.findById(id);
        return ResponseEntity.ok().body(projetoDTO);
    }
    */

    @GetMapping("/{id}/with-tarefas")
    public ResponseEntity<ProjetoWithTarefasDTO> getProjetoWithTarefas(@PathVariable Long id) {
        ProjetoWithTarefasDTO projeto = projetoService.findProjetoWithTarefas(id);
        return ResponseEntity.ok(projeto);
    }

    @GetMapping("/{id}/full")
    public ResponseEntity<ProjetoWithUsersAndTarefasDTO> getProjetoWithUsersAndTarefas(@PathVariable Long id) {
        ProjetoWithUsersAndTarefasDTO projeto = projetoService.findProjetoWithUsersAndTarefas(id);
        return ResponseEntity.ok(projeto);
    }

    @PostMapping
    public ResponseEntity<ProjetoWithUsersDTO> insert(@Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO savedDto = projetoService.insert(dto);

        // Send notifications to all assigned users
        savedDto.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        projetoService.findByIdWithUsers(savedDto.getId()),
                        NotificationType.PROJETO_ATRIBUIDO,
                        user
                )
        );

        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedDto.getId()).toUri();
        return ResponseEntity.created(uri).body(savedDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ProjetoWithUsersDTO> update(@PathVariable Long id, @Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO newDto = projetoService.update(id, dto);

        // Send notifications to all assigned users
        newDto.getUsers().forEach(user ->
                notificationService.createProjectNotification(
                        projetoService.findByIdWithUsers(newDto.getId()),
                        NotificationType.PROJETO_ATUALIZADO,
                        user
                )
        );

        return ResponseEntity.ok().body(newDto);
    }

    // Aplicar este endpoint para edição apenas da info básica (campos de texto e data) de um projeto
    @PatchMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> updateBasicInfo(@PathVariable Long id, @Valid @RequestBody ProjetoDTO dto) {
        ProjetoDTO newDto = projetoService.updateBasicInfo(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projetoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProjetoWithUsersAndTarefasDTO>> searchProjetos(@RequestParam String query) {
        List<ProjetoWithUsersAndTarefasDTO> results = projetoService.searchProjetos(query);
        return ResponseEntity.ok().body(results);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjetoWithUsersDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        ProjetoWithUsersDTO updatedProjeto = projetoService.updateStatus(id, status);
        return ResponseEntity.ok().body(updatedProjeto);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProjetoWithUsersDTO>> filterProjetos(
            @RequestParam(required = false) String designacao,
            @RequestParam(required = false) String entidade,
            @RequestParam(required = false) String prioridade,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            @RequestParam(required = false) String status,
            Pageable pageable) {

        Page<ProjetoWithUsersDTO> result = projetoService.filterProjetos(
                designacao, entidade, prioridade, startDate, endDate, status, pageable);
        return ResponseEntity.ok().body(result);
    }

}
