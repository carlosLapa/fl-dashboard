package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Projeto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    // Update existing methods to check deletedAt
    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.deletedAt IS NULL")
    Page<Projeto> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p LEFT JOIN p.tarefas t " +
            "WHERE p.id = :id AND p.deletedAt IS NULL " +
            "AND (t IS NULL OR t.deletedAt IS NULL)")
    Optional<Projeto> findByIdWithTarefas(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p LEFT JOIN p.tarefas t " +
            "WHERE p.id = :id AND p.deletedAt IS NULL " +
            "AND (t IS NULL OR t.deletedAt IS NULL)")
    Optional<Projeto> findByIdWithUsersAndTarefas(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Projeto> findByIdActive(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.deletedAt IS NULL AND " +
            "(LOWER(p.designacao) LIKE :designacaoQuery OR LOWER(p.entidade) LIKE :entidadeQuery)")
    List<Projeto> findByDesignacaoLikeIgnoreCaseOrEntidadeLikeIgnoreCase(
            @Param("designacaoQuery") String designacaoQuery,
            @Param("entidadeQuery") String entidadeQuery
    );

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.deletedAt IS NULL")
    List<Projeto> findAllActive();

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.deletedAt IS NULL " +
            "AND (:startDate IS NULL OR p.prazo >= :startDate) " +
            "AND (:endDate IS NULL OR p.prazo <= :endDate)")
    Page<Projeto> findByPrazoRange(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            Pageable pageable);

    @EntityGraph(attributePaths = {"users", "tarefas", "tarefas.users", "colunas"})
    @Query("SELECT p FROM Projeto p WHERE p.deletedAt IS NULL " +
            "AND (:designacao IS NULL OR LOWER(p.designacao) LIKE LOWER(CONCAT('%', :designacao, '%'))) " +
            "AND (:entidade IS NULL OR LOWER(p.entidade) LIKE LOWER(CONCAT('%', :entidade, '%'))) " +
            "AND (:prioridade IS NULL OR LOWER(p.prioridade) LIKE LOWER(CONCAT('%', :prioridade, '%'))) " +
            "AND (:startDate IS NULL OR p.prazo >= :startDate) " +
            "AND (:endDate IS NULL OR p.prazo <= :endDate) " +
            "AND (:status IS NULL OR p.status = :status)")
    Page<Projeto> findByFilters(
            @Param("designacao") String designacao,
            @Param("entidade") String entidade,
            @Param("prioridade") String prioridade,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("status") String status,
            Pageable pageable);

    List<Projeto> findByClienteId(Long id);

    @Query("SELECT p FROM Projeto p LEFT JOIN FETCH p.users WHERE p.cliente.id = :clienteId")
    List<Projeto> findByClienteIdWithUsers(@Param("clienteId") Long clienteId);

}
