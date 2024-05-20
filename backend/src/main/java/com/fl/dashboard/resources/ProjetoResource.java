package com.fl.dashboard.resources;

import com.fl.dashboard.entities.Projeto;
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
    public ResponseEntity<List<Projeto>> findAll() {
        List<Projeto> list = projetoService.findAll();
        return ResponseEntity.ok().body(list);
    }

}
