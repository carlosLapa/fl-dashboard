package com.fl.dashboard.services;

import com.fl.dashboard.dto.ColunaWithProjetoDTO;
import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.entities.Coluna;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.repositories.ColunaRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ColunaService {
    @Autowired
    private ColunaRepository colunaRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    public List<ColunaWithProjetoDTO> getColumnsForProject(Long projetoId) {
        List<Coluna> colunas = colunaRepository.findByProjetoIdOrderByOrdemAsc(projetoId);
        return colunas.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ColunaWithProjetoDTO createColumn(ColunaWithProjetoDTO colunaDTO) {
        Coluna coluna = convertToEntity(colunaDTO);
        Coluna savedColuna = colunaRepository.save(coluna);
        return convertToDTO(savedColuna);
    }

    private ColunaWithProjetoDTO convertToDTO(Coluna coluna) {
        //ProjetoDTO projetoDTO = new ProjetoDTO(coluna.getProjeto().getId(), coluna.getProjeto().getDesignacao());
        return new ColunaWithProjetoDTO(coluna.getId(), coluna.getStatus(), coluna.getTitulo(), coluna.getOrdem(), coluna.getProjeto().getId());
    }

    private Coluna convertToEntity(ColunaWithProjetoDTO colunaDTO) {
        Coluna coluna = new Coluna();
        coluna.setStatus(colunaDTO.getStatus());
        coluna.setTitulo(colunaDTO.getTitulo());
        coluna.setOrdem(colunaDTO.getOrdem());

        Projeto projeto = projetoRepository.findById(colunaDTO.getProjetoId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found"));
        coluna.setProjeto(projeto);

        return coluna;
    }
}


