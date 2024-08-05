package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.services.TarefaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Set;

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

}
