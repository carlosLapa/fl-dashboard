package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.services.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoResource {

    @Autowired
    private ProjetoService projetoService;

    @GetMapping
    public ResponseEntity<Page<ProjetoDTO>> findAll(Pageable pageable) {
        Page<ProjetoDTO> list = projetoService.findAllPaged(pageable);
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> findById(@PathVariable Long id) {
        ProjetoDTO projetoDTO = projetoService.findById(id);
        return ResponseEntity.ok().body(projetoDTO);
    }

    @PostMapping
    public ResponseEntity<ProjetoDTO> insert(@Valid @RequestBody ProjetoDTO dto) {
        dto = projetoService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ProjetoDTO> update(@PathVariable Long id, @Valid @RequestBody ProjetoDTO dto) {
        ProjetoDTO newDto = projetoService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projetoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
