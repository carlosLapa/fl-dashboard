package com.fl.dashboard.resources;

import com.fl.dashboard.dto.EspecialidadeDTO;
import com.fl.dashboard.services.EspecialidadeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(value = "/especialidades")
public class EspecialidadeResource {

    @Autowired
    private EspecialidadeService especialidadeService;

    @GetMapping
    public ResponseEntity<List<EspecialidadeDTO>> findAll() {
        List<EspecialidadeDTO> list = especialidadeService.findAll();
        return ResponseEntity.ok().body(list);
    }

}
