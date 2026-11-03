package com.fl.dashboard.repositories;

import com.fl.dashboard.dto.RequisicaoEquipamentoDetalheDTO;
import com.fl.dashboard.entities.RequisicaoEquipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface RequisicaoEquipamentoRepository extends JpaRepository<RequisicaoEquipamento, Long> {

    String DETALHE_FROM = """
            SELECT new com.fl.dashboard.dto.RequisicaoEquipamentoDetalheDTO(
                r.id, e.id, e.nome, r.dataInicio, r.dataFim, r.observacoes, t.id, t.descricao, p.designacao)
            FROM RequisicaoEquipamento r
            JOIN r.equipamento e
            JOIN r.tarefa t
            LEFT JOIN t.projeto p
            """;

    // A requisição stops holding the equipamento once its tarefa is finished, archived or deleted,
    // or its projeto is archived or deleted. Explicit LEFT JOIN above: implicit t.projeto path
    // navigation compiles to an INNER JOIN, which would drop projeto-less tarefas.
    String ATIVA = """
            WHERE t.deletedAt IS NULL
            AND t.arquivadaEm IS NULL
            AND t.status <> com.fl.dashboard.enums.TarefaStatus.DONE
            AND (p.id IS NULL OR (p.deletedAt IS NULL AND p.arquivadaEm IS NULL))
            """;

    @Query(DETALHE_FROM + ATIVA + """
            AND e.id = :equipamentoId
            AND t.id <> :excludeTarefaId
            AND r.dataInicio <= :dataFim
            AND r.dataFim >= :dataInicio
            ORDER BY r.dataInicio
            """)
    List<RequisicaoEquipamentoDetalheDTO> findConflitos(@Param("equipamentoId") Long equipamentoId,
                                                        @Param("dataInicio") LocalDate dataInicio,
                                                        @Param("dataFim") LocalDate dataFim,
                                                        @Param("excludeTarefaId") Long excludeTarefaId);

    @Query(DETALHE_FROM + ATIVA + """
            AND r.dataFim >= :desde
            ORDER BY e.nome, r.dataInicio
            """)
    List<RequisicaoEquipamentoDetalheDTO> findAtivasDesde(@Param("desde") LocalDate desde);

    // Each row is [tarefaId, userId, userName]; selected as scalars to avoid loading User entities.
    @Query("SELECT t.id, u.id, u.name FROM Tarefa t JOIN t.users u WHERE t.id IN :tarefaIds ORDER BY u.name")
    List<Object[]> findColaboradoresByTarefaIds(@Param("tarefaIds") Collection<Long> tarefaIds);
}
