package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNif(String nif);

    // For INSERT validation - check if numero exists at all
    Optional<Cliente> findByNumero(Integer numero);

    // For UPDATE validation - check if numero exists excluding the current cliente
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cliente c WHERE c.numero = :numero AND c.id <> :clienteId AND c.deletedAt IS NULL")
    boolean existsByNumeroAndIdNot(@Param("numero") Integer numero, @Param("clienteId") Long clienteId);

    @Query("SELECT c FROM Cliente c WHERE c.deletedAt IS NULL")
    Page<Cliente> findAllActive(Pageable pageable);

    @Query("SELECT c FROM Cliente c WHERE c.deletedAt IS NULL")
    List<Cliente> findAllActive();

    @EntityGraph(attributePaths = {"projetos"})
    @Query("SELECT c FROM Cliente c WHERE c.deletedAt IS NULL")
    List<Cliente> findAllWithProjetos();

    @EntityGraph(attributePaths = {"projetos"})
    @Query("SELECT c FROM Cliente c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Cliente> findByIdWithProjetos(@Param("id") Long id);

    @Query("SELECT c FROM Cliente c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Cliente> findByIdAndActiveStatus(@Param("id") Long id);

    // Updated to use native SQL query to search within JSON arrays
    @Query(value = "SELECT c.* FROM tb_cliente c WHERE c.deleted_at IS NULL AND (" +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.nif) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "JSON_SEARCH(LOWER(c.responsaveis), 'one', LOWER(CONCAT('%', :query, '%')), NULL, '$[*]') IS NOT NULL OR " +
            "JSON_SEARCH(LOWER(c.contactos), 'one', LOWER(CONCAT('%', :query, '%')), NULL, '$[*]') IS NOT NULL OR " +
            "JSON_SEARCH(LOWER(c.emails), 'one', LOWER(CONCAT('%', :query, '%')), NULL, '$[*]') IS NOT NULL)",
            nativeQuery = true)
    List<Cliente> searchByNameOrNifOrContacts(@Param("query") String query);

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.projetos p LEFT JOIN FETCH p.users WHERE c.id = :clienteId")
    Optional<Cliente> findByIdWithProjetosAndUsers(@Param("clienteId") Long clienteId);
}
