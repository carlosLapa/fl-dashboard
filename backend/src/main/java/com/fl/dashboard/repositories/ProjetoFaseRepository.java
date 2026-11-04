package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.ProjetoFase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetoFaseRepository extends JpaRepository<ProjetoFase, Long> {

    @Query("SELECT f FROM ProjetoFase f WHERE f.projeto.id = :projetoId ORDER BY f.ordem ASC, f.id ASC")
    List<ProjetoFase> findByProjetoIdOrdered(@Param("projetoId") Long projetoId);

    @Query("SELECT f FROM ProjetoFase f WHERE f.id = :faseId AND f.projeto.id = :projetoId")
    Optional<ProjetoFase> findByIdAndProjetoId(@Param("faseId") Long faseId, @Param("projetoId") Long projetoId);

    @Query("SELECT COALESCE(MAX(f.ordem), -1) FROM ProjetoFase f WHERE f.projeto.id = :projetoId")
    Integer findMaxOrdem(@Param("projetoId") Long projetoId);

    // Deleting a phase never deletes its tarefas: they go back to "sem fase". Includes soft-deleted and
    // archived tarefas too, otherwise their FK would block the phase delete.
    @Modifying
    @Query("UPDATE Tarefa t SET t.fase = NULL WHERE t.fase.id = :faseId")
    int desassociarTarefas(@Param("faseId") Long faseId);
}
