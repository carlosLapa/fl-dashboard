package com.fl.dashboard.services;

import com.fl.dashboard.dto.EquipamentoDTO;
import com.fl.dashboard.entities.Equipamento;
import com.fl.dashboard.repositories.EquipamentoRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;

    public EquipamentoService(EquipamentoRepository equipamentoRepository) {
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional(readOnly = true)
    public List<EquipamentoDTO> findAll(boolean incluirInativos) {
        List<Equipamento> list = incluirInativos
                ? equipamentoRepository.findAllByOrderByNomeAsc()
                : equipamentoRepository.findByAtivoTrueOrderByNomeAsc();
        return list.stream().map(EquipamentoDTO::new).toList();
    }

    @Transactional
    public EquipamentoDTO insert(EquipamentoDTO dto) {
        String nome = dto.getNome().trim();
        if (equipamentoRepository.existsByNomeIgnoreCase(nome)) {
            throw new DatabaseException("Já existe um equipamento com o nome \"" + nome + "\"");
        }
        Equipamento entity = new Equipamento();
        entity.setNome(nome);
        entity.setDescricao(dto.getDescricao());
        return new EquipamentoDTO(equipamentoRepository.save(entity));
    }

    @Transactional
    public EquipamentoDTO update(Long id, EquipamentoDTO dto) {
        Equipamento entity = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não foi encontrado"));
        String nome = dto.getNome().trim();
        if (equipamentoRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new DatabaseException("Já existe um equipamento com o nome \"" + nome + "\"");
        }
        entity.setNome(nome);
        entity.setDescricao(dto.getDescricao());
        if (dto.getAtivo() != null) {
            entity.setAtivo(dto.getAtivo());
        }
        return new EquipamentoDTO(equipamentoRepository.save(entity));
    }
}
