package com.fl.dashboard.services;

import com.fl.dashboard.dto.EspecialidadeDTO;
import com.fl.dashboard.entities.Especialidade;
import com.fl.dashboard.repositories.EspecialidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EspecialidadeService {

    private final EspecialidadeRepository especialidadeRepository;

    public EspecialidadeService(EspecialidadeRepository especialidadeRepository) {
        this.especialidadeRepository = especialidadeRepository;
    }

    @Transactional(readOnly = true)
    public List<EspecialidadeDTO> findAll() {
        List<Especialidade> list = especialidadeRepository.findAll();
        return list.stream().map(EspecialidadeDTO::new).toList();
    }

}
