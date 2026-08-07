package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.ProjetoMetricsSnapshot;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoMetricsSnapshotRepository extends JpaRepository<ProjetoMetricsSnapshot, Long> {

    @EntityGraph(attributePaths = {"triggeredByUser"})
    List<ProjetoMetricsSnapshot> findByProjetoIdOrderBySnapshotDateAsc(Long projetoId);

}
