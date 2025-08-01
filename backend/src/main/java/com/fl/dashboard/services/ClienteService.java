package com.fl.dashboard.services;

import com.fl.dashboard.dto.*;
import com.fl.dashboard.entities.Cliente;
import com.fl.dashboard.entities.Projeto;
import com.fl.dashboard.repositories.ClienteRepository;
import com.fl.dashboard.repositories.ProjetoRepository;
import com.fl.dashboard.services.exceptions.DatabaseException;
import com.fl.dashboard.services.exceptions.ResourceNotFoundException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ClienteService {
    private static final String CLIENTE_NOT_FOUND_MSG = "Cliente com o id: ";
    private static final String NOT_FOUND_MSG = " não encontrado";

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Transactional(readOnly = true)
    public Page<ClienteDTO> findAllPaged(Pageable pageable) {
        Page<Cliente> page = clienteRepository.findAllActive(pageable);
        return page.map(ClienteDTO::new);
    }

    @Transactional(readOnly = true)
    public List<ClienteDTO> findAll() {
        List<Cliente> list = clienteRepository.findAllActive();
        return list.stream().map(ClienteDTO::new).toList();
    }

    @Transactional(readOnly = true)
    public ClienteDTO findById(Long id) {
        Cliente entity = clienteRepository.findByIdAndActiveStatus(id)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
        return new ClienteDTO(entity);
    }

    @Transactional(readOnly = true)
    public ClienteWithProjetosDTO findByIdWithProjetos(Long id) {
        Cliente entity = clienteRepository.findByIdWithProjetos(id)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
        return new ClienteWithProjetosDTO(entity);
    }

    @Transactional(readOnly = true)
    public List<ClienteWithProjetosDTO> findAllWithProjetos() {
        List<Cliente> list = clienteRepository.findAllWithProjetos();
        return list.stream().map(ClienteWithProjetosDTO::new).toList();
    }

    @Transactional
    public List<ProjetoDTO> getProjetosByCliente(Long clienteId) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with ID: " + clienteId));
        return cliente.getProjetos().stream()
                .map(ProjetoDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProjetoWithUsersDTO> getProjetosWithUsersByClienteId(Long clienteId) {
        // First check if the client exists - just verify it exists without assigning to a variable
        if (!clienteRepository.existsById(clienteId)) {
            throw new ResourceNotFoundException("Cliente not found with id: " + clienteId);
        }
        // Get all projects for this client with eager loading of users
        List<Projeto> projetos = projetoRepository.findByClienteIdWithUsers(clienteId);
        // Map to ProjetoWithUsersDTO using your existing constructor
        return projetos.stream()
                .map(ProjetoWithUsersDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteWithProjetosAndUsersDTO getClienteWithProjetosAndUsers(Long clienteId) {
        Cliente cliente = clienteRepository.findByIdWithProjetosAndUsers(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with id: " + clienteId));
        return new ClienteWithProjetosAndUsersDTO(cliente);
    }

    @Transactional
    public ClienteDTO insert(ClienteInsertDTO dto) {
        Cliente entity = new Cliente();
        copyDTOtoEntity(dto, entity);
        entity = clienteRepository.save(entity);
        return new ClienteDTO(entity);
    }

    @Transactional
    public ClienteDTO update(Long id, ClienteUpdateDTO dto) {
        try {
            Cliente entity = clienteRepository.findByIdAndActiveStatus(id)
                    .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
            copyDTOtoEntity(dto, entity);
            entity = clienteRepository.save(entity);
            return new ClienteDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    @Transactional
    public void delete(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recurso não encontrado");
        }
        try {
            // Soft delete - set deletedAt timestamp instead of actually deleting
            Cliente cliente = clienteRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));
            cliente.setDeletedAt(Timestamp.from(Instant.now()));
            clienteRepository.save(cliente);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Não permitido! Integridade da BD em causa: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<ClienteDTO> searchClientes(String query) {
        if (query == null || query.isEmpty()) {
            return findAll();
        }
        // Updated to use the renamed repository method
        List<Cliente> clientes = clienteRepository.searchByNameOrNifOrContacts(query);
        return clientes.stream()
                .map(ClienteDTO::new)
                .toList();
    }

    @Transactional
    public ClienteWithProjetosDTO insertWithProjetos(ClienteWithProjetosDTO dto) {
        Cliente entity = new Cliente();
        copyDTOtoEntity(dto, entity);
        entity = clienteRepository.save(entity); // Save first to get an ID
        // Associate projetos with the cliente
        if (dto.getProjetos() != null && !dto.getProjetos().isEmpty()) {
            associateProjetosWithCliente(dto.getProjetos(), entity);
        }
        return new ClienteWithProjetosDTO(entity);
    }

    @Transactional
    public ClienteWithProjetosDTO updateWithProjetos(Long id, ClienteWithProjetosDTO dto) {
        try {
            Cliente entity = clienteRepository.findByIdAndActiveStatus(id)
                    .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + id + NOT_FOUND_MSG));
            copyDTOtoEntity(dto, entity);
            entity = clienteRepository.save(entity);
            // Update projeto associations
            Set<ProjetoMinDTO> projetos = dto.getProjetos();
            if (projetos != null) {
                // First, remove this cliente from any projetos that are no longer associated
                List<Projeto> currentProjetos = projetoRepository.findByClienteId(id);
                for (Projeto projeto : currentProjetos) {
                    boolean stillAssociated = projetos.stream()
                            .anyMatch(p -> p.getId().equals(projeto.getId()));
                    if (!stillAssociated) {
                        projeto.setCliente(null);
                        projetoRepository.save(projeto);
                    }
                }
                // Then associate the cliente with the projetos in the DTO
                associateProjetosWithCliente(projetos, entity);
            }
            return new ClienteWithProjetosDTO(entity);
        } catch (EntityNotFoundException e) {
            throw new ResourceNotFoundException("Id: " + id + " não foi encontrado");
        }
    }

    // Updated to handle collections
    private void copyDTOtoEntity(ClienteDTO dto, Cliente entity) {
        entity.setName(dto.getName());
        entity.setMorada(dto.getMorada());
        entity.setNif(dto.getNif());

        // Handle the new collection fields
        if (dto.getContactos() != null) {
            entity.setContactos(new ArrayList<>(dto.getContactos()));
        } else {
            entity.setContactos(new ArrayList<>());
        }

        if (dto.getResponsaveis() != null) {
            entity.setResponsaveis(new ArrayList<>(dto.getResponsaveis()));
        } else {
            entity.setResponsaveis(new ArrayList<>());
        }

        if (dto.getEmails() != null) {
            entity.setEmails(new ArrayList<>(dto.getEmails()));
        } else {
            entity.setEmails(new ArrayList<>());
        }

        // For backward compatibility with old DTOs that might still have the single fields
        // This is temporary and can be removed once all DTOs are updated
        if (dto.getContacto() != null && !dto.getContacto().isEmpty() &&
                (entity.getContactos() == null || entity.getContactos().isEmpty())) {
            List<String> contactos = new ArrayList<>();
            contactos.add(dto.getContacto());
            entity.setContactos(contactos);
        }

        if (dto.getResponsavel() != null && !dto.getResponsavel().isEmpty() &&
                (entity.getResponsaveis() == null || entity.getResponsaveis().isEmpty())) {
            List<String> responsaveis = new ArrayList<>();
            responsaveis.add(dto.getResponsavel());
            entity.setResponsaveis(responsaveis);
        }
    }

    private void associateProjetosWithCliente(Set<ProjetoMinDTO> projetoDTOs, Cliente cliente) {
        for (ProjetoMinDTO projetoDTO : projetoDTOs) {
            Projeto projeto = projetoRepository.findById(projetoDTO.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto not found with id: " + projetoDTO.getId()));
            projeto.setCliente(cliente);
            projetoRepository.save(projeto);
        }
    }

    // to associate a single projeto with a cliente
    @Transactional
    public ClienteWithProjetosDTO associateProjetoWithCliente(Long clienteId, Long projetoId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found with id: " + clienteId));
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found with id: " + projetoId));
        projeto.setCliente(cliente);
        projetoRepository.save(projeto);
        return new ClienteWithProjetosDTO(cliente);
    }

    // to disassociate a projeto from a cliente
    @Transactional
    public void disassociateProjetoFromCliente(Long clienteId, Long projetoId) {
        // First check if cliente exists
        if (!clienteRepository.existsById(clienteId)) {
            throw new ResourceNotFoundException("Cliente not found with id: " + clienteId);
        }
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto not found with id: " + projetoId));
        if (projeto.getCliente() != null && projeto.getCliente().getId().equals(clienteId)) {
            projeto.setCliente(null);
            projetoRepository.save(projeto);
        } else {
            throw new ResourceNotFoundException("Projeto is not associated with this Cliente");
        }
    }

    @Transactional
    public ClienteDTO addResponsavel(Long clienteId, String responsavel) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getResponsaveis() == null) {
            cliente.setResponsaveis(new ArrayList<>());
        }

        cliente.getResponsaveis().add(responsavel);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO removeResponsavel(Long clienteId, int index) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getResponsaveis() == null || index < 0 || index >= cliente.getResponsaveis().size()) {
            throw new ResourceNotFoundException("Responsável não encontrado no índice: " + index);
        }

        cliente.getResponsaveis().remove(index);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO addContacto(Long clienteId, String contacto) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getContactos() == null) {
            cliente.setContactos(new ArrayList<>());
        }

        cliente.getContactos().add(contacto);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO removeContacto(Long clienteId, int index) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getContactos() == null || index < 0 || index >= cliente.getContactos().size()) {
            throw new ResourceNotFoundException("Contacto não encontrado no índice: " + index);
        }

        cliente.getContactos().remove(index);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO addEmail(Long clienteId, String email) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getEmails() == null) {
            cliente.setEmails(new ArrayList<>());
        }

        cliente.getEmails().add(email);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

    @Transactional
    public ClienteDTO removeEmail(Long clienteId, int index) {
        Cliente cliente = clienteRepository.findByIdAndActiveStatus(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException(CLIENTE_NOT_FOUND_MSG + clienteId + NOT_FOUND_MSG));

        if (cliente.getEmails() == null || index < 0 || index >= cliente.getEmails().size()) {
            throw new ResourceNotFoundException("Email não encontrado no índice: " + index);
        }

        cliente.getEmails().remove(index);
        cliente = clienteRepository.save(cliente);

        return new ClienteDTO(cliente);
    }

}
