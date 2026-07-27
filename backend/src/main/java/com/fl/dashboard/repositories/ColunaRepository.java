package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Coluna;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColunaRepository extends JpaRepository<Coluna, Long> {

    // ColunaService.convertToDTO only reads id/status/titulo/ordem/projeto.getId() — tarefas and
    // tarefas.users were fetched for nothing. Combining those two collections here recreated the
    // same Cartesian-explosion pattern that caused the Projeto prod OOM, on every Kanban board load.
    @EntityGraph(attributePaths = {"projeto"})
    List<Coluna> findByProjetoIdOrderByOrdemAsc(Long projetoId);
}

