package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Projeto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    @EntityGraph(attributePaths = "users")
    Page<Projeto> findAll(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Projeto p LEFT JOIN FETCH p.tarefas t WHERE p.id = :id")
    Optional<Projeto> findByIdWithTarefas(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Projeto p LEFT JOIN FETCH p.users LEFT JOIN FETCH p.tarefas WHERE p.id = :id")
    Optional<Projeto> findByIdWithUsersAndTarefas(@Param("id") Long id);

    @Query("SELECT p FROM Projeto p WHERE LOWER(p.designacao) LIKE :designacaoQuery OR LOWER(p.entidade) LIKE :entidadeQuery")
    List<Projeto> findByDesignacaoLikeIgnoreCaseOrEntidadeLikeIgnoreCase(
            @Param("designacaoQuery") String designacaoQuery,
            @Param("entidadeQuery") String entidadeQuery
    );
}
