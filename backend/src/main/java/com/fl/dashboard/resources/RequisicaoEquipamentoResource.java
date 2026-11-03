package com.fl.dashboard.resources;

import com.fl.dashboard.dto.RequisicaoEquipamentoDetalheDTO;
import com.fl.dashboard.services.RequisicaoEquipamentoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

// Requisições are created and edited through their tarefa (/tarefas/with-associations); these
// read-only endpoints exist so anyone can see who holds an equipamento and resolve a conflict.
@RestController
@RequestMapping(value = "/requisicoes")
public class RequisicaoEquipamentoResource {

    private final RequisicaoEquipamentoService requisicaoService;

    public RequisicaoEquipamentoResource(RequisicaoEquipamentoService requisicaoService) {
        this.requisicaoService = requisicaoService;
    }

    @GetMapping
    public ResponseEntity<List<RequisicaoEquipamentoDetalheDTO>> findAtuaisEFuturas() {
        return ResponseEntity.ok(requisicaoService.findAtuaisEFuturas());
    }

    @GetMapping("/conflitos")
    public ResponseEntity<List<RequisicaoEquipamentoDetalheDTO>> findConflitos(
            @RequestParam Long equipamentoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false) Long excludeTarefaId) {
        return ResponseEntity.ok(requisicaoService.findConflitos(equipamentoId, dataInicio, dataFim, excludeTarefaId));
    }
}
