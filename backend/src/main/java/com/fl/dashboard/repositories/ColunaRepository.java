package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Coluna;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColunaRepository extends JpaRepository<Coluna, Long> {

    @EntityGraph(attributePaths = {"projeto", "tarefas", "tarefas.users"})
    List<Coluna> findByProjetoIdOrderByOrdemAsc(Long projetoId);
}

