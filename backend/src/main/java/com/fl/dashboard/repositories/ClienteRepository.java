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

    @EntityGraph(attributePaths = {"projetos"})
    @Query("SELECT c FROM Cliente c WHERE c.deletedAt IS NULL AND " +
            "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.nif) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.responsavel) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Cliente> searchByNameOrNifOrResponsavel(@Param("query") String query);
}
