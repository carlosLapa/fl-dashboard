package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ClienteDTO;
import com.fl.dashboard.dto.ClienteWithProjetosDTO;
import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.services.ClienteService;
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
@RequestMapping(value = "/clientes")
public class ClienteResource {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteDTO>> findAll() {
        List<ClienteDTO> list = clienteService.findAll();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ClienteDTO>> findAllPaged(Pageable pageable) {
        Page<ClienteDTO> page = clienteService.findAllPaged(pageable);
        return ResponseEntity.ok().body(page);
    }

    @GetMapping("/with-projetos")
    public ResponseEntity<List<ClienteWithProjetosDTO>> findAllWithProjetos() {
        List<ClienteWithProjetosDTO> list = clienteService.findAllWithProjetos();
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ClienteDTO> findById(@PathVariable Long id) {
        ClienteDTO clienteDTO = clienteService.findById(id);
        return ResponseEntity.ok().body(clienteDTO);
    }

    @GetMapping("/{id}/with-projetos")
    public ResponseEntity<ClienteWithProjetosDTO> findByIdWithProjetos(@PathVariable Long id) {
        ClienteWithProjetosDTO dto = clienteService.findByIdWithProjetos(id);
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{clienteId}/projetos")
    public ResponseEntity<List<ProjetoDTO>> getProjetosByCliente(@PathVariable Long clienteId) {
        List<ProjetoDTO> projetoDTOs = clienteService.getProjetosByCliente(clienteId);
        return ResponseEntity.ok(projetoDTOs);
    }

    @PostMapping
    public ResponseEntity<ClienteDTO> insert(@Valid @RequestBody ClienteDTO dto) {
        ClienteDTO newDto = clienteService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.getId()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<ClienteDTO> update(@PathVariable Long id, @Valid @RequestBody ClienteDTO dto) {
        ClienteDTO updatedDto = clienteService.update(id, dto);
        return ResponseEntity.ok().body(updatedDto);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clienteService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClienteDTO>> searchClientes(@RequestParam String query) {
        List<ClienteDTO> results = clienteService.searchClientes(query);
        return ResponseEntity.ok().body(results);
    }

    @PostMapping("/with-projetos")
    public ResponseEntity<ClienteWithProjetosDTO> insertWithProjetos(@Valid @RequestBody ClienteWithProjetosDTO dto) {
        dto = clienteService.insertWithProjetos(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(dto.getId()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @PutMapping(value = "/{id}/with-projetos")
    public ResponseEntity<ClienteWithProjetosDTO> updateWithProjetos(
            @PathVariable Long id,
            @Valid @RequestBody ClienteWithProjetosDTO dto) {
        dto = clienteService.updateWithProjetos(id, dto);
        return ResponseEntity.ok().body(dto);
    }

    // endpoints for associating/disassociating individual projetos
    @PostMapping("/{clienteId}/projetos/{projetoId}")
    public ResponseEntity<ClienteWithProjetosDTO> associateProjetoWithCliente(
            @PathVariable Long clienteId,
            @PathVariable Long projetoId) {
        ClienteWithProjetosDTO dto = clienteService.associateProjetoWithCliente(clienteId, projetoId);
        return ResponseEntity.ok().body(dto);
    }

    @DeleteMapping("/{clienteId}/projetos/{projetoId}")
    public ResponseEntity<Void> disassociateProjetoFromCliente(
            @PathVariable Long clienteId,
            @PathVariable Long projetoId) {
        clienteService.disassociateProjetoFromCliente(clienteId, projetoId);
        return ResponseEntity.noContent().build();
    }

}

