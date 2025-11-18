package com.fl.dashboard.resources;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.services.ExternoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/externos")
public class ExternoResource {

    private final ExternoService externoService;

    public ExternoResource(ExternoService externoService) {
        this.externoService = externoService;
    }

    @GetMapping
    public ResponseEntity<List<ExternoDTO>> findAll() {
        List<ExternoDTO> list = externoService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ExternoDTO>> findAllPaged(Pageable pageable) {
        Page<ExternoDTO> page = externoService.findAllPaged(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/with-projetos")
    public ResponseEntity<List<ExternoWithProjetosDTO>> findAllWithProjetos() {
        List<ExternoWithProjetosDTO> list = externoService.findAllWithProjetos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ExternoDTO> findById(@PathVariable Long id) {
        ExternoDTO externoDTO = externoService.findById(id);
        return ResponseEntity.ok().body(externoDTO);
    }

    @GetMapping("/{id}/with-projetos")
    public ResponseEntity<ExternoWithProjetosDTO> findByIdWithProjetos(@PathVariable Long id) {
        ExternoWithProjetosDTO dto = externoService.findByIdWithProjetos(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{id}/with-tarefas")
    public ResponseEntity<ExternoWithTarefasDTO> findByIdWithTarefas(@PathVariable Long id) {
        ExternoWithTarefasDTO dto = externoService.findByIdWithTarefas(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{externoId}/tarefas")
    public ResponseEntity<List<TarefaDTO>> getTarefasByExterno(@PathVariable Long externoId) {
        List<TarefaDTO> tarefaDTOs = externoService.getTarefasByExterno(externoId);
        return ResponseEntity.ok(tarefaDTOs);
    }

    @PostMapping
    public ResponseEntity<ExternoDTO> insert(@Valid @RequestBody ExternoInsertDTO dto) {
        ExternoDTO newDto = externoService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PostMapping("/with-projetos")
    public ResponseEntity<ExternoWithProjetosDTO> insertWithProjetos(@Valid @RequestBody ExternoWithProjetosDTO dto) {
        dto = externoService.insertWithProjetos(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ExternoDTO> update(@PathVariable Long id, @Valid @RequestBody ExternoUpdateDTO dto) {
        ExternoDTO updatedDto = externoService.update(id, dto);
        return ResponseEntity.ok().body(updatedDto);
    }

    @PutMapping(value = "/{id}/with-projetos")
    public ResponseEntity<ExternoWithProjetosDTO> updateWithProjetos(
            @PathVariable Long id,
            @Valid @RequestBody ExternoWithProjetosDTO dto) {
        dto = externoService.updateWithProjetos(id, dto);
        return ResponseEntity.ok().body(dto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        externoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{id}/hard")
    public ResponseEntity<Void> hardDelete(@PathVariable Long id) {
        externoService.hardDelete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExternoDTO>> searchExternos(@RequestParam String query) {
        List<ExternoDTO> results = externoService.searchExternos(query);
        return ResponseEntity.ok().body(results);
    }
}
