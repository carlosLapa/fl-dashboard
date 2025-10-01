package com.fl.dashboard.services;

import com.fl.dashboard.dto.ProjetoDTO;
import com.fl.dashboard.dto.PropostaDTO;
import com.fl.dashboard.dto.PropostaWithClienteIdsDTO;
import com.fl.dashboard.dto.PropostaWithClientesDTO;
import com.fl.dashboard.entities.Cliente;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.entities.Proposta;
import com.fl.dashboard.repositories.ClienteRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.repositories.PropostaRepository;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import com.fl.dashboard.utils.ProjetoDTOMapper;
import com.fl.dashboard.utils.PropostaProjetoMapperUtil;
import com.fl.dashboard.utils.PropostaToProjetoMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PropostaService {

    private final PropostaRepository propostaRepository;
    private final ClienteRepository clienteRepository;
    private final PropostaToProjetoMapper propostaToProjetoMapper;
    private final ProjetoRepository projetoRepository;
    private final ProjetoDTOMapper projetoDTOMapper;

    public PropostaService(
            PropostaRepository propostaRepository,
            ClienteRepository clienteRepository,
            PropostaToProjetoMapper propostaToProjetoMapper, ProjetoRepository projetoRepository, ProjetoDTOMapper projetoDTOMapper
    ) {
        this.propostaRepository = propostaRepository;
        this.clienteRepository = clienteRepository;
        this.propostaToProjetoMapper = propostaToProjetoMapper;
        this.projetoRepository = projetoRepository;
        this.projetoDTOMapper = projetoDTOMapper;
    }

    @Transactional(readOnly = true)
    public PropostaDTO findById(Long id) {
        Proposta proposta = propostaRepository.findByIdActive(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta not found"));
        return new PropostaDTO(proposta);
    }

    @Transactional(readOnly = true)
    public Page<PropostaWithClientesDTO> findAllPaged(Pageable pageable) {
        Page<Proposta> list = propostaRepository.findAll(pageable);
        return list.map(PropostaWithClientesDTO::new);
    }

    @Transactional(readOnly = true)
    public List<PropostaWithClientesDTO> findAll() {
        List<PropostaWithClientesDTO> list = new ArrayList<>();
        for (Proposta proposta : propostaRepository.findAllActive()) {
            PropostaWithClientesDTO dto = new PropostaWithClientesDTO(proposta, proposta.getClientes());
            list.add(dto);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<PropostaWithClientesDTO> findByDesignacao(String query) {
        String searchQuery = "%" + query.toLowerCase() + "%";
        List<Proposta> propostas = propostaRepository.findByDesignacaoLikeIgnoreCase(searchQuery);
        List<PropostaWithClientesDTO> list = new ArrayList<>();
        for (Proposta proposta : propostas) {
            list.add(new PropostaWithClientesDTO(proposta));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<PropostaWithClientesDTO> findByClienteId(Long clienteId) {
        List<Proposta> propostas = propostaRepository.findByClientes_Id(clienteId);
        List<PropostaWithClientesDTO> list = new ArrayList<>();
        for (Proposta proposta : propostas) {
            list.add(new PropostaWithClientesDTO(proposta));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Page<PropostaWithClientesDTO> filterPropostas(
            String designacao,
            String prioridade,
            Date startDate,
            Date endDate,
            String status,
            Date propostaStartDate,
            Date propostaEndDate,
            Date adjudicacaoStartDate,
            Date adjudicacaoEndDate,
            String tipo,
            Pageable pageable) {

        Page<Proposta> result = propostaRepository.findByFilters(
                designacao, prioridade, startDate, endDate, status,
                propostaStartDate, propostaEndDate,
                adjudicacaoStartDate, adjudicacaoEndDate, tipo, pageable);

        return result.map(proposta -> new PropostaWithClientesDTO(proposta, proposta.getClientes()));
    }

    @Transactional
    public PropostaWithClientesDTO insert(PropostaWithClienteIdsDTO propostaDTO) {
        Proposta entity = new Proposta();

        updatePropostaFromDTO(propostaDTO, entity);

        Proposta savedEntity = propostaRepository.save(entity);
        propostaRepository.flush();

        return new PropostaWithClientesDTO(savedEntity, savedEntity.getClientes());
    }

    @Transactional
    public PropostaWithClientesDTO update(Long id, PropostaWithClienteIdsDTO propostaDTO) {
        Proposta entity = propostaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada com ID: " + id));

        updatePropostaFromDTO(propostaDTO, entity);

        // Atribui o Projeto se projetoId estiver presente
        if (propostaDTO.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(propostaDTO.getProjetoId()).orElse(null);
            entity.setProjeto(projeto);
        }

        Proposta savedEntity = propostaRepository.save(entity);
        propostaRepository.flush();

        return new PropostaWithClientesDTO(savedEntity, savedEntity.getClientes());
    }

    @Transactional
    public void delete(Long id) {
        Proposta proposta = propostaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada com ID: " + id));
        proposta.markAsDeleted();
        propostaRepository.save(proposta);
    }


    @Transactional
    public ProjetoDTO adjudicarEConverterParaProjeto(Long propostaId) {
        Proposta proposta = propostaRepository.findByIdActive(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        Projeto projeto = propostaToProjetoMapper.convert(proposta);
        projetoRepository.save(projeto);

        proposta = propostaRepository.findByIdActive(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        proposta.setProjeto(projeto);
        propostaRepository.save(proposta);

        return projetoDTOMapper.toDTO(projeto);
    }

    @Transactional
    public void atualizarStatusAdjudicada(Long propostaId) {
        Proposta proposta = propostaRepository.findByIdActive(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));
        proposta.setStatus("ADJUDICADA");
        propostaRepository.save(proposta);
    }

    // Utilitário para copiar dados do DTO para a entidade
    private void copyDTOtoEntity(PropostaDTO dto, Proposta entity) {
        PropostaProjetoMapperUtil.copyDTOtoProposta(dto, entity);
    }

    // Utilitário para evitar duplicação
    private Set<Cliente> getClientesFromIds(Set<Long> clienteIds) {
        Set<Cliente> clientes = new HashSet<>();
        if (clienteIds != null) {
            for (Long clienteId : clienteIds) {
                Cliente cliente = clienteRepository.findById(clienteId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + clienteId));
                clientes.add(cliente);
            }
        }
        return clientes;
    }

    // Utilitário com a lógica de atualização
    private void updatePropostaFromDTO(PropostaDTO dto, Proposta entity) {
        entity.setClientes(getClientesFromIds(dto.getClienteIds()));
        copyDTOtoEntity(dto, entity);
        if (dto.getProjetoId() != null) {
            Projeto projeto = projetoRepository.findById(dto.getProjetoId()).orElse(null);
            entity.setProjeto(projeto);
        }
    }

}
