package com.fl.dashboard.services;

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

    public PropostaService(
            PropostaRepository propostaRepository,
            ClienteRepository clienteRepository,
            PropostaToProjetoMapper propostaToProjetoMapper, ProjetoRepository projetoRepository
    ) {
        this.propostaRepository = propostaRepository;
        this.clienteRepository = clienteRepository;
        this.propostaToProjetoMapper = propostaToProjetoMapper;
        this.projetoRepository = projetoRepository;
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

        Set<Long> clienteIds = propostaDTO.getClienteIds();
        if (clienteIds != null) {
            Set<Cliente> clientes = new HashSet<>();
            for (Long clienteId : clienteIds) {
                Cliente cliente = clienteRepository.findById(clienteId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + clienteId));
                clientes.add(cliente);
            }
            entity.setClientes(clientes);
        }

        copyDTOtoEntity(propostaDTO, entity);

        Proposta savedEntity = propostaRepository.save(entity);
        propostaRepository.flush();

        return new PropostaWithClientesDTO(savedEntity, savedEntity.getClientes());
    }

    @Transactional
    public PropostaWithClientesDTO update(Long id, PropostaWithClienteIdsDTO propostaDTO) {
        Proposta entity = propostaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada com ID: " + id));

        Set<Long> clienteIds = propostaDTO.getClienteIds();
        if (clienteIds != null) {
            Set<Cliente> clientes = new HashSet<>();
            for (Long clienteId : clienteIds) {
                Cliente cliente = clienteRepository.findById(clienteId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + clienteId));
                clientes.add(cliente);
            }
            entity.setClientes(clientes);
        }

        copyDTOtoEntity(propostaDTO, entity);

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

    // Utilitário para copiar dados do DTO para a entidade
    private void copyDTOtoEntity(PropostaDTO dto, Proposta entity) {
        PropostaProjetoMapperUtil.copyDTOtoProposta(dto, entity);
    }

    @Transactional
    public Projeto adjudicarEConverterParaProjeto(Long propostaId) {
        Proposta proposta = propostaRepository.findByIdActive(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        Projeto projeto = propostaToProjetoMapper.convert(proposta);
        // Salve o projeto usando o ProjetoRepository (injete no service)
        projetoRepository.save(projeto);

        return projeto;
    }

    @Transactional
    public void atualizarStatusAdjudicada(Long propostaId) {
        Proposta proposta = propostaRepository.findByIdActive(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));
        proposta.setStatus("ADJUDICADA");
        propostaRepository.save(proposta);
    }
}
