package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.ProjetoUserHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoUserHistoryRepository extends JpaRepository<ProjetoUserHistory, Long> {

    @EntityGraph(attributePaths = {"projeto"})
    List<ProjetoUserHistory> findByUserIdOrderByEventDateAsc(Long userId);

}
