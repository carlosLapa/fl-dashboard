package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.dto.ProjetoWithTarefasDTO;
import com.fl.dashboard.dto.ProjetoWithUsersAndTarefasDTO;
import com.fl.dashboard.dto.ProjetoWithUsersDTO;
import com.fl.dashboard.services.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoResource {

    @Autowired
    private ProjetoService projetoService;

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
        dto = projetoService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ProjetoWithUsersDTO> update(@PathVariable Long id, @Valid @RequestBody ProjetoWithUsersDTO dto) {
        ProjetoWithUsersDTO newDto = projetoService.update(id, dto);
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

}
