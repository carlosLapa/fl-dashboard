package com.fl.dashboard.services;

import com.fl.dashboard.entities.Departamento;
import com.fl.dashboard.repositories.DepartamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartamentoService {

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Transactional(readOnly = true)
    public List<Departamento> findAll() {
        return departamentoRepository.findAll();
    }

}
