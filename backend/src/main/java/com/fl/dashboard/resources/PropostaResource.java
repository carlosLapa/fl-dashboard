package com.fl.dashboard.resources;

import com.fl.dashboard.dto.PropostaDTO;
import com.fl.dashboard.dto.PropostaWithClienteIdsDTO;
import com.fl.dashboard.dto.PropostaWithClientesDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.services.PropostaService;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/propostas")
public class PropostaResource {

    @Autowired
    private PropostaService propostaService;

    @GetMapping
    public ResponseEntity<Page<PropostaWithClientesDTO>> findAll(Pageable pageable) {
        Page<PropostaWithClientesDTO> list = propostaService.findAllPaged(pageable);
        return ResponseEntity.ok().body(list);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PropostaDTO> findById(@PathVariable Long id) {
        try {
            PropostaDTO propostaDTO = propostaService.findById(id);
            return ResponseEntity.ok().body(propostaDTO);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PROPOSTA')")
    public ResponseEntity<PropostaWithClientesDTO> insert(@Valid @RequestBody PropostaWithClienteIdsDTO dto) {
        PropostaWithClientesDTO savedDto = propostaService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedDto.getId()).toUri();
        return ResponseEntity.created(uri).body(savedDto);
    }

    @PutMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('EDIT_PROPOSTA')")
    public ResponseEntity<PropostaWithClientesDTO> update(@PathVariable Long id, @Valid @RequestBody PropostaWithClienteIdsDTO dto) {
        try {
            PropostaWithClientesDTO newDto = propostaService.update(id, dto);
            return ResponseEntity.ok().body(newDto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{id}")
    @PreAuthorize("hasAuthority('DELETE_PROPOSTA')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            propostaService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropostaWithClientesDTO>> searchPropostas(@RequestParam String query) {
        List<PropostaWithClientesDTO> results = propostaService.findByDesignacao(query);
        return ResponseEntity.ok().body(results);
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<PropostaWithClientesDTO>> filterPropostas(
            @RequestParam(required = false) String designacao,
            @RequestParam(required = false) String prioridade,
            @RequestParam(required = false) Date startDate,
            @RequestParam(required = false) Date endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Date propostaStartDate,
            @RequestParam(required = false) Date propostaEndDate,
            @RequestParam(required = false) Date adjudicacaoStartDate,
            @RequestParam(required = false) Date adjudicacaoEndDate,
            @RequestParam(required = false) String tipo,
            Pageable pageable) {

        Page<PropostaWithClientesDTO> result = propostaService.filterPropostas(
                designacao, prioridade, startDate, endDate, status,
                propostaStartDate, propostaEndDate, adjudicacaoStartDate, adjudicacaoEndDate, tipo, pageable);
        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/by-cliente/{clienteId}")
    public ResponseEntity<List<PropostaWithClientesDTO>> getPropostasByCliente(@PathVariable Long clienteId) {
        List<PropostaWithClientesDTO> propostas = propostaService.findByClienteId(clienteId);
        return ResponseEntity.ok(propostas);
    }

    @PostMapping("/{id}/adjudicar")
    @PreAuthorize("hasAuthority('ADJUDICAR_PROPOSTA')")
    public ResponseEntity<?> adjudicarProposta(@PathVariable Long id) {
        try {
            // Adjudica e converte a proposta em projeto
            Projeto novoProjeto = propostaService.adjudicarEConverterParaProjeto(id);
            // Atualiza status da proposta para "ADJUDICADA" (se desejar)
            propostaService.atualizarStatusAdjudicada(id);

            // Retorna o novo projeto criado (pode ser um DTO)
            return ResponseEntity.ok(novoProjeto);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
