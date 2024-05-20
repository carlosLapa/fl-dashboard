package com.fl.dashboard.services;

import com.fl.dashboard.entities.Especialidade;
import com.fl.dashboard.repositories.EspecialidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EspecialidadeService {

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Transactional(readOnly = true)
    public List<Especialidade> findAll() {
        return especialidadeRepository.findAll();
    }

}
