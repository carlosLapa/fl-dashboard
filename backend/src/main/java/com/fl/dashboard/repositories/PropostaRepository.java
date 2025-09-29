package com.fl.dashboard.repositories;

import com.fl.dashboard.entities.Proposta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropostaRepository extends JpaRepository<Proposta, Long> {

    @EntityGraph(attributePaths = {"clientes"})
    @Query("SELECT p FROM Proposta p WHERE p.deletedAt IS NULL")
    Page<Proposta> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"clientes"})
    @Query("SELECT p FROM Proposta p WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Proposta> findByIdActive(@Param("id") Long id);

    @EntityGraph(attributePaths = {"clientes"})
    @Query("SELECT p FROM Proposta p WHERE p.deletedAt IS NULL AND LOWER(p.designacao) LIKE :designacaoQuery")
    List<Proposta> findByDesignacaoLikeIgnoreCase(@Param("designacaoQuery") String designacaoQuery);

    @EntityGraph(attributePaths = {"clientes"})
    @Query("SELECT p FROM Proposta p WHERE p.deletedAt IS NULL")
    List<Proposta> findAllActive();

    @EntityGraph(attributePaths = {"clientes"})
    @Query("SELECT p FROM Proposta p WHERE p.deletedAt IS NULL " +
            "AND (:startDate IS NULL OR p.prazo >= :startDate) " +
            "AND (:endDate IS NULL OR p.prazo <= :endDate)")
    Page<Proposta> findByPrazoRange(
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            Pageable pageable);

    @Query("SELECT p FROM Proposta p WHERE p.deletedAt IS NULL " +
            "AND (:designacao IS NULL OR LOWER(p.designacao) LIKE LOWER(CONCAT('%', :designacao, '%'))) " +
            "AND (:prioridade IS NULL OR LOWER(p.prioridade) LIKE LOWER(CONCAT('%', :prioridade, '%'))) " +
            "AND (:startDate IS NULL OR p.prazo >= :startDate) " +
            "AND (:endDate IS NULL OR p.prazo <= :endDate) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:propostaStartDate IS NULL OR p.dataProposta >= :propostaStartDate) " +
            "AND (:propostaEndDate IS NULL OR p.dataProposta <= :propostaEndDate) " +
            "AND (:adjudicacaoStartDate IS NULL OR p.dataAdjudicacao >= :adjudicacaoStartDate) " +
            "AND (:adjudicacaoEndDate IS NULL OR p.dataAdjudicacao <= :adjudicacaoEndDate)" +
            "AND (:tipo IS NULL OR p.tipo = :tipo)")
    Page<Proposta> findByFilters(
            @Param("designacao") String designacao,
            @Param("prioridade") String prioridade,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("status") String status,
            @Param("propostaStartDate") Date propostaStartDate,
            @Param("propostaEndDate") Date propostaEndDate,
            @Param("adjudicacaoStartDate") Date adjudicacaoStartDate,
            @Param("adjudicacaoEndDate") Date adjudicacaoEndDate,
            @Param("tipo") String tipo,
            Pageable pageable);

    List<Proposta> findByClientes_Id(Long clienteId);
}