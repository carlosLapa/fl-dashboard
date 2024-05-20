package com.fl.dashboard.services;

import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.repositories.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjetoService {

    @Autowired
    private ProjetoRepository projetoRepository;

    @Transactional(readOnly = true)
    public List<Projeto> findAll() {
        return projetoRepository.findAll();
    }

}
