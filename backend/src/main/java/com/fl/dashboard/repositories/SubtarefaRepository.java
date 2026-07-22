package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Subtarefa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubtarefaRepository extends JpaRepository<Subtarefa, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<Subtarefa> findByTarefaIdOrderByIdAsc(Long tarefaId);

    boolean existsByTarefaId(Long tarefaId);

    Optional<Subtarefa> findByIdAndTarefaId(Long id, Long tarefaId);

    @Query("SELECT COALESCE(SUM(s.percentual), 0) FROM Subtarefa s WHERE s.tarefa.id = :tarefaId AND s.concluida = true")
    BigDecimal sumPercentualConcluidoByTarefaId(@Param("tarefaId") Long tarefaId);

}
