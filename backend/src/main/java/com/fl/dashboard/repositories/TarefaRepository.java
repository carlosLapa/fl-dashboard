package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.EstadoTarefa;
import com.fl.dashboard.enums.TarefaStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    @EntityGraph(attributePaths = {"users", "projeto", "projeto.colunas", "coluna"})
    @Query("SELECT DISTINCT t FROM Tarefa t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithUsersAndProjeto(@Param("id") Long id);

    @EntityGraph(attributePaths = {"projeto", "projeto.colunas"})
    @Query("SELECT t FROM Tarefa t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithProjetoActive(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users"})
    @Query("SELECT t FROM Tarefa t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithUsersActive(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT t FROM Tarefa t WHERE t.deletedAt IS NULL AND (LOWER(t.descricao) LIKE :descricaoQuery OR LOWER(t.status) LIKE :statusQuery)")
    List<Tarefa> findByDescricaoLikeIgnoreCaseOrStatusLikeIgnoreCase(
            @Param("descricaoQuery") String descricaoQuery,
            @Param("statusQuery") String statusQuery
    );

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT t FROM Tarefa t WHERE t.prazoReal < :deadline AND t.status != :status AND t.deletedAt IS NULL")
    List<Tarefa> findByPrazoRealBeforeAndStatusNot(
            @Param("deadline") LocalDate deadline,
            @Param("status") EstadoTarefa status
    );

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT DISTINCT t FROM Tarefa t " +
            "LEFT JOIN t.users u " +
            "WHERE t.deletedAt IS NULL")
    List<Tarefa> findAllActive();

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT t FROM Tarefa t WHERE t.status = :status AND t.deletedAt IS NULL")
    List<Tarefa> findAllByStatus(@Param("status") TarefaStatus status);

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT t FROM Tarefa t WHERE t.prioridade = :prioridade AND t.deletedAt IS NULL")
    List<Tarefa> findAllByPrioridade(@Param("prioridade") String prioridade);

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT DISTINCT t FROM Tarefa t " +
            "JOIN t.users u " +
            "WHERE u.id = :userId " +
            "AND t.deletedAt IS NULL")
    List<Tarefa> findAllByUserId(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {"users", "projeto", "projeto.colunas"})
    @Query("SELECT t FROM Tarefa t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdActive(@Param("id") Long id);

    @EntityGraph(attributePaths = {"users", "projeto"})
    @Query("SELECT t FROM Tarefa t WHERE t.prazoReal < :deadline AND t.status != :status AND t.deletedAt IS NULL")
    List<Tarefa> findByPrazoRealBeforeAndStatusNot(
            @Param("deadline") LocalDate deadline,
            @Param("status") TarefaStatus status
    );

    @EntityGraph(attributePaths = {"users", "projeto", "coluna"})
    @Query("SELECT DISTINCT t FROM Tarefa t " +
            "JOIN t.users u " +
            "WHERE u.id = :userId " +
            "AND t.deletedAt IS NULL")
    List<Tarefa> findAllActiveByUserId(@Param("userId") Long userId);

    @EntityGraph(attributePaths = {"users", "projeto", "coluna"})
    @Query("SELECT DISTINCT t FROM Tarefa t " +
            "JOIN t.users u " +
            "WHERE u.id = :userId " +
            "AND t.deletedAt IS NULL")
    Page<Tarefa> findAllActiveByUserIdPaginated(@Param("userId") Long userId, Pageable pageable);

}
