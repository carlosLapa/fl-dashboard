package com.fl.dashboard.resources;

import com.fl.dashboard.dto.DepartamentoDTO;
import com.fl.dashboard.services.DepartamentoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/departamentos")
public class DepartamentoResource {

    private final DepartamentoService departamentoService;

    public DepartamentoResource(DepartamentoService departamentoService) {
        this.departamentoService = departamentoService;
    }

    @GetMapping
    public ResponseEntity<List<DepartamentoDTO>> findAll() {
        List<DepartamentoDTO> list = departamentoService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<DepartamentoDTO> findById(@PathVariable Long id) {
        DepartamentoDTO departamentoDTO = departamentoService.findById(id);
        return ResponseEntity.ok().body(departamentoDTO);
    }

    @PostMapping
    public ResponseEntity<DepartamentoDTO> insert(@Valid @RequestBody DepartamentoDTO departamentoDTO) {
        DepartamentoDTO newDto = departamentoService.insert(departamentoDTO);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<DepartamentoDTO> update(@PathVariable Long id, @Valid @RequestBody DepartamentoDTO dto) {
        DepartamentoDTO newDto = departamentoService.update(id, dto);
        return ResponseEntity.ok().body(newDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        departamentoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
