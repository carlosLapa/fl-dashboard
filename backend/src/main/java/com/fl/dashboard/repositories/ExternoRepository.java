package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Externo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternoRepository extends JpaRepository<Externo, Long> {

    Optional<Externo> findByEmail(String email);

    // Find all with related entities (similar to UserRepository.findAllWithProjetos)
    @EntityGraph(attributePaths = {"projetos", "tarefas", "especialidades"})
    @Query("SELECT e FROM Externo e WHERE e.deletedAt IS NULL")
    List<Externo> findAllWithRelationships();

    @Query("SELECT e FROM Externo e WHERE e.deletedAt IS NULL")
    Page<Externo> findAllActive(Pageable pageable);

    @EntityGraph(attributePaths = {"projetos", "tarefas", "especialidades"})
    @Query("SELECT e FROM Externo e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Externo> findByIdWithRelationships(@Param("id") Long id);

    @EntityGraph(attributePaths = {"projetos", "tarefas", "especialidades"})
    @Query("SELECT e FROM Externo e WHERE e.deletedAt IS NULL AND " +
            "(LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Externo> searchByNameOrEmail(@Param("query") String query);

    // Delete associations when deleting an Externo (similar to UserRepository.deleteTaskUserAssociationsByUserId)
    @Modifying
    @Query(value = "DELETE FROM tb_projeto_externo WHERE externo_id = :externoId", nativeQuery = true)
    void deleteProjetoExternoAssociationsByExternoId(@Param("externoId") Long externoId);

    @Modifying
    @Query(value = "DELETE FROM tb_tarefa_externo WHERE externo_id = :externoId", nativeQuery = true)
    void deleteTarefaExternoAssociationsByExternoId(@Param("externoId") Long externoId);

    @Modifying
    @Query(value = "DELETE FROM tb_externo_especialidades WHERE externo_id = :externoId", nativeQuery = true)
    void deleteExternoEspecialidadesAssociationsByExternoId(@Param("externoId") Long externoId);
}
