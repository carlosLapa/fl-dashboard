package com.fl.dashboard.utils;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.dto.ProjetoWithUsersDTO;
import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.User;
import com.fl.dashboard.repositories.ExternoRepository;
import com.fl.dashboard.repositories.UserRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class ProjetoDTOMapper {

    private final UserRepository userRepository;
    private final ExternoRepository externoRepository;

    public ProjetoDTOMapper(UserRepository userRepository, ExternoRepository externoRepository) {
        this.userRepository = userRepository;
        this.externoRepository = externoRepository;
    }

    public void copyDTOtoEntity(ProjetoWithUsersDTO projetoDTO, Projeto entity) {
        // Primeiro, copiamos os dados básicos, mas NÃO processamos os externoIds
        // pois isso será feito separadamente no método update do ProjetoService
        copyBasicDTOtoEntityWithoutExternos(projetoDTO, entity);

        // Processar usuários
        entity.getUsers().clear();
        if (projetoDTO.getUsers() != null) {
            projetoDTO.getUsers().forEach(userDTO -> {
                User user = userRepository.findById(userDTO.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDTO.getId()));
                entity.getUsers().add(user);
            });
        }
    }

    // Novo método que copia dados básicos sem processar externoIds
    public void copyBasicDTOtoEntityWithoutExternos(ProjetoDTO projetoDTO, Projeto entity) {

        entity.setProjetoAno(projetoDTO.getProjetoAno());
        entity.setDesignacao(projetoDTO.getDesignacao());
        entity.setEntidade(projetoDTO.getEntidade());
        entity.setPrazo(projetoDTO.getPrazo());
        entity.setPrioridade(projetoDTO.getPrioridade());
        entity.setObservacao(projetoDTO.getObservacao());
        entity.setStatus(projetoDTO.getStatus());
        entity.setTipo(projetoDTO.getTipo());

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

    public void copyBasicDTOtoEntity(ProjetoDTO projetoDTO, Projeto entity) {

        // Copiar dados básicos
        copyBasicDTOtoEntityWithoutExternos(projetoDTO, entity);

        // Processar colaboradores externos a partir de externoIds
        if (projetoDTO.getExternoIds() != null) {

            // Inicializar a coleção de externos se necessário
            if (entity.getExternos() == null) {
                entity.setExternos(new HashSet<>());
            } else {
                // Importante: preservar referência à coleção original, mas limpar conteúdo
                entity.getExternos().clear();
            }

            // Se há externoIds, adicionar os externos correspondentes
            if (!projetoDTO.getExternoIds().isEmpty()) {
                for (Long externoId : projetoDTO.getExternoIds()) {
                    Externo externo = externoRepository.findById(externoId)
                            .orElseThrow(() -> new ResourceNotFoundException("Externo não encontrado: " + externoId));
                    entity.getExternos().add(externo);
                }
            }
        }
    }

    public ProjetoDTO toDTO(Projeto entity) {
        ProjetoDTO dto = new ProjetoDTO();
        dto.setId(entity.getId());
        dto.setProjetoAno(entity.getProjetoAno());
        dto.setDesignacao(entity.getDesignacao());
        dto.setEntidade(entity.getEntidade());
        dto.setPrazo(entity.getPrazo());
        dto.setPrioridade(entity.getPrioridade());
        dto.setObservacao(entity.getObservacao());
        dto.setStatus(entity.getStatus());
        dto.setTipo(entity.getTipo());
        dto.setCoordenadorId(entity.getCoordenador() != null ? entity.getCoordenador().getId() : null);
        dto.setDataProposta(entity.getDataProposta());
        dto.setDataAdjudicacao(entity.getDataAdjudicacao());
        // Adicione outros campos conforme necessário
        return dto;
    }


}