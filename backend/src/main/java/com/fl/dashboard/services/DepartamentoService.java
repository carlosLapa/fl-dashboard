package com.fl.dashboard.services;

import com.fl.dashboard.dto.DepartamentoDTO;
import com.fl.dashboard.entities.Departamento;
import com.fl.dashboard.repositories.DepartamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartamentoService {

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Transactional(readOnly = true)
    public List<DepartamentoDTO> findAll() {
        List<Departamento> list = departamentoRepository.findAll();
        return list.stream().map(DepartamentoDTO::new).collect(Collectors.toList());
    }

}
