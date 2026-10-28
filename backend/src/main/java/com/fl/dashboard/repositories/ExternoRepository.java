package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Externo;
import com.fl.dashboard.enums.ProjetoStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
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

    @Query("SELECT e FROM Externo e WHERE e.deletedAt IS NULL")
    List<Externo> findAllActive();

    // One row per Externo that has at least one non-deleted Projeto: [externoId, activeProjetoCount].
    // Externos with no row have never been assigned to a (non-deleted) Projeto. Archived Projetos
    // count as history but never as active, regardless of their status.
    @Query("SELECT e.id, SUM(CASE WHEN p.status IN :activeStatuses AND p.arquivadaEm IS NULL THEN 1 ELSE 0 END) " +
            "FROM Externo e JOIN e.projetos p " +
            "WHERE e.id IN :externoIds AND p.deletedAt IS NULL " +
            "GROUP BY e.id")
    List<Object[]> countActiveProjetosByExternoIds(@Param("externoIds") Collection<Long> externoIds,
                                                   @Param("activeStatuses") Collection<ProjetoStatus> activeStatuses);

    @EntityGraph(attributePaths = {"projetos"})
    @Query("SELECT e FROM Externo e WHERE e.deletedAt IS NULL")
    List<Externo> findAllWithProjetos();

    // Split from a single findByIdWithRelationships: ExternoWithProjetosDTO only reads projetos
    // (+ especialidades via the EAGER base ExternoDTO), never tarefas.
    @EntityGraph(attributePaths = {"projetos"})
    @Query("SELECT e FROM Externo e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Externo> findByIdWithProjetos(@Param("id") Long id);

    @Query("SELECT e FROM Externo e WHERE e.id = :id AND e.deletedAt IS NULL")
    Optional<Externo> findByIdAndActiveStatus(@Param("id") Long id);

    // Maps to plain ExternoDTO (ExternoService.searchByNameOrEmail), which never reads projetos or
    // tarefas — especialidades is EAGER by default and resolves fine on a direct root-entity query
    // like this one (no @EntityGraph needed for it here).
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
