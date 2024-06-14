package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Projeto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    @EntityGraph(attributePaths = "users")
    Page<Projeto> findAll(Pageable pageable);

}
