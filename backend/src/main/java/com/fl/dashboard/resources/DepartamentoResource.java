package com.fl.dashboard.resources;

import com.fl.dashboard.dto.DepartamentoDTO;
import com.fl.dashboard.services.DepartamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/departamento")
public class DepartamentoResource {

    @Autowired
    private DepartamentoService departamentoService;

    @GetMapping
    public ResponseEntity<List<DepartamentoDTO>> findAll() {
        List<DepartamentoDTO> list = departamentoService.findAll();
        return ResponseEntity.ok().body(list);
    }

}
