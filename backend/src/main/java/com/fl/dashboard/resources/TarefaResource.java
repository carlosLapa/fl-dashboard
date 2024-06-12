package com.fl.dashboard.resources;

import com.fl.dashboard.dto.TarefaDTO;
import com.fl.dashboard.services.TarefaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

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

    @PostMapping
    public ResponseEntity<TarefaDTO> insert(@Valid @RequestBody TarefaDTO tarefaDTO) {
        TarefaDTO newDto = tarefaService.insert(tarefaDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<TarefaDTO> update(@PathVariable Long id, @Valid @RequestBody TarefaDTO dto) {
        TarefaDTO newDto = tarefaService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tarefaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
