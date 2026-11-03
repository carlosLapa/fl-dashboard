package com.fl.dashboard.resources;

import com.fl.dashboard.dto.EquipamentoDTO;
import com.fl.dashboard.services.EquipamentoService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/equipamentos")
public class EquipamentoResource {

    private final EquipamentoService equipamentoService;

    public EquipamentoResource(EquipamentoService equipamentoService) {
        this.equipamentoService = equipamentoService;
    }

    // Open to every authenticated user: anyone who can edit a tarefa picks from this list.
    @GetMapping
    public ResponseEntity<List<EquipamentoDTO>> findAll(
            @RequestParam(defaultValue = "false") boolean incluirInativos) {
        return ResponseEntity.ok(equipamentoService.findAll(incluirInativos));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_EQUIPAMENTOS')")
    public ResponseEntity<EquipamentoDTO> insert(@Valid @RequestBody EquipamentoDTO dto) {
        EquipamentoDTO result = equipamentoService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(result.getId()).toUri();
        return ResponseEntity.created(uri).body(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_EQUIPAMENTOS')")
    public ResponseEntity<EquipamentoDTO> update(@PathVariable Long id, @Valid @RequestBody EquipamentoDTO dto) {
        return ResponseEntity.ok(equipamentoService.update(id, dto));
    }
}
