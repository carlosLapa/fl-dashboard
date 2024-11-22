package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    @Query("SELECT t FROM Tarefa t LEFT JOIN FETCH t.users LEFT JOIN FETCH t.projeto WHERE t.id = :id")
    Optional<Tarefa> findByIdWithUsersAndProjeto(@Param("id") Long id);

    @Query("SELECT t FROM Tarefa t WHERE LOWER(t.descricao) LIKE :descricaoQuery OR LOWER(t.status) LIKE :statusQuery")
    List<Tarefa> findByDescricaoLikeIgnoreCaseOrStatusLikeIgnoreCase(
            @Param("descricaoQuery") String descricaoQuery,
            @Param("statusQuery") String statusQuery
    );

}
