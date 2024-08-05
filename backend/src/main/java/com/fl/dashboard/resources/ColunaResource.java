package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ColunaWithProjetoDTO;
import com.fl.dashboard.services.ColunaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colunas")
public class ColunaResource {
    @Autowired
    private ColunaService colunaService;

    @GetMapping("/projeto/{projetoId}")
    public ResponseEntity<List<ColunaWithProjetoDTO>> getColumnsForProject(@PathVariable Long projetoId) {
        List<ColunaWithProjetoDTO> colunas = colunaService.getColumnsForProject(projetoId);
        return ResponseEntity.ok(colunas);
    }

    @PostMapping
    public ResponseEntity<ColunaWithProjetoDTO> createColumn(@RequestBody ColunaWithProjetoDTO colunaDTO) {
        ColunaWithProjetoDTO createdColuna = colunaService.createColumn(colunaDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdColuna);
    }
}

