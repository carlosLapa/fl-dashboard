package com.fl.dashboard.services;

import com.fl.dashboard.dto.EspecialidadeDTO;
import com.fl.dashboard.entities.Especialidade;
import com.fl.dashboard.repositories.EspecialidadeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EspecialidadeService {

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Transactional(readOnly = true)
    public List<EspecialidadeDTO> findAll() {
        List<Especialidade> list = especialidadeRepository.findAll();
        return list.stream().map(EspecialidadeDTO::new).collect(Collectors.toList());
    }

}
