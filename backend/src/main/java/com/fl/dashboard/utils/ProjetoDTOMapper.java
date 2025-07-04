package com.fl.dashboard.utils;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.dto.ProjetoWithUsersDTO;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class ProjetoDTOMapper {

    private final UserRepository userRepository;

    public ProjetoDTOMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void copyDTOtoEntity(ProjetoWithUsersDTO projetoDTO, Projeto entity) {
        copyBasicDTOtoEntity(projetoDTO, entity);

        entity.getUsers().clear();
        if (projetoDTO.getUsers() != null) {
            projetoDTO.getUsers().forEach(userDTO -> {
                User user = userRepository.findById(userDTO.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDTO.getId()));
                entity.getUsers().add(user);
            });
        }
    }

    public void copyBasicDTOtoEntity(ProjetoDTO projetoDTO, Projeto entity) {
        entity.setProjetoAno(projetoDTO.getProjetoAno());
        entity.setDesignacao(projetoDTO.getDesignacao());
        entity.setEntidade(projetoDTO.getEntidade());
        entity.setPrazo(projetoDTO.getPrazo());
        entity.setPrioridade(projetoDTO.getPrioridade());
        entity.setObservacao(projetoDTO.getObservacao());
        entity.setStatus(projetoDTO.getStatus());

        // Handle the coordenador field
        if (projetoDTO.getCoordenadorId() != null) {
            User coordenador = userRepository.findById(projetoDTO.getCoordenadorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coordenador not found: " + projetoDTO.getCoordenadorId()));
            entity.setCoordenador(coordenador);
        } else {
            entity.setCoordenador(null);
        }

        // Handle the date fields
        entity.setDataProposta(projetoDTO.getDataProposta());
        entity.setDataAdjudicacao(projetoDTO.getDataAdjudicacao());
    }
}