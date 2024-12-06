package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Tarefa;
import com.fl.dashboard.enums.EstadoTarefa;
import com.fl.dashboard.enums.TarefaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    @Query("SELECT t FROM Tarefa t LEFT JOIN FETCH t.users LEFT JOIN FETCH t.projeto WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithUsersAndProjeto(@Param("id") Long id);

    @Query("SELECT t FROM Tarefa t LEFT JOIN FETCH t.projeto WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithProjetoActive(@Param("id") Long id);

    @Query("SELECT t FROM Tarefa t LEFT JOIN FETCH t.users WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdWithUsersActive(@Param("id") Long id);

    @Query("SELECT t FROM Tarefa t WHERE t.deletedAt IS NULL AND (LOWER(t.descricao) LIKE :descricaoQuery OR LOWER(t.status) LIKE :statusQuery)")
    List<Tarefa> findByDescricaoLikeIgnoreCaseOrStatusLikeIgnoreCase(
            @Param("descricaoQuery") String descricaoQuery,
            @Param("statusQuery") String statusQuery
    );

    @Query("SELECT t FROM Tarefa t WHERE t.prazoReal < :deadline AND t.status != :status AND t.deletedAt IS NULL")
    List<Tarefa> findByPrazoRealBeforeAndStatusNot(
            @Param("deadline") LocalDate deadline,
            @Param("status") EstadoTarefa status
    );

    @Query("SELECT t FROM Tarefa t WHERE t.deletedAt IS NULL")
    List<Tarefa> findAllActive();

    @Query("SELECT t FROM Tarefa t WHERE t.id = :id AND t.deletedAt IS NULL")
    Optional<Tarefa> findByIdActive(@Param("id") Long id);

    @Query("SELECT t FROM Tarefa t WHERE t.prazoReal < :deadline AND t.status != :status AND t.deletedAt IS NULL")
    List<Tarefa> findByPrazoRealBeforeAndStatusNot(
            @Param("deadline") LocalDate deadline,
            @Param("status") TarefaStatus status
    );

}
