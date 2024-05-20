package com.fl.dashboard.resources;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.services.ProjetoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/projetos")
public class ProjetoResource {

    @Autowired
    private ProjetoService projetoService;

    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> findAll() {
        List<ProjetoDTO> list = projetoService.findAll();
        return ResponseEntity.ok().body(list);
    }

}
