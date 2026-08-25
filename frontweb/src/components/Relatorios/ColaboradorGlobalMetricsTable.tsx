import React from 'react';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { CollaboratorGlobalMetricsDTO } from '../../types/colaboradorReport';
import './ColaboradorGlobalMetricsTable.scss';

interface ColaboradorGlobalMetricsTableProps {
  colaboradores: CollaboratorGlobalMetricsDTO[];
  onViewHistory: (colaboradorId: number) => void;
}

/**
 * Table showing collaborator performance metrics aggregated across ALL projects.
 * Data arrives pre-sorted by total tasks (descending) from the backend.
 *
 * Deliberately not wrapped in a Card (unlike the per-project metrics tables):
 * this is a page-level table like ClienteTable/UserTable, which use a plain
 * container so the title above lines up with the table without accounting
 * for Card.Body's padding.
 */
const ColaboradorGlobalMetricsTable: React.FC<
  ColaboradorGlobalMetricsTableProps
> = ({ colaboradores, onViewHistory }) => {
  return (
    <div className="colaborador-global-metrics-table">
      <h5 className="mb-4">Totais Gerais</h5>

      {colaboradores.length === 0 ? (
        <div className="text-center text-muted py-5">
          Nenhum colaborador com tarefas ativas encontrado
        </div>
      ) : (
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th className="text-center">Projetos</th>
                <th className="text-center">Total</th>
                <th className="text-center">Concluídas</th>
                <th className="text-center">Em Progresso</th>
                <th className="text-center">Pendentes</th>
                <th className="text-center">Taxa de Conclusão</th>
                <th className="text-center">Tempo Médio (dias úteis)</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.map((col) => (
                <tr key={col.colaboradorId}>
                  <td>
                    <strong>{col.colaboradorNome}</strong>
                  </td>
                  <td className="text-center numeric-cell">
                    {col.totalProjetos}
                  </td>
                  <td className="text-center numeric-cell">
                    {col.totalTarefas}
                  </td>
                  <td className="text-center text-success numeric-cell">
                    {col.tarefasConcluidas}
                  </td>
                  <td className="text-center text-warning-dark numeric-cell">
                    {col.tarefasEmProgresso}
                  </td>
                  <td className="text-center text-danger numeric-cell">
                    {col.tarefasPendentes}
                  </td>
                  <td className="text-center numeric-cell">
                    <span
                      className={`badge ${
                        col.taxaConclusao >= 75
                          ? 'bg-success'
                          : col.taxaConclusao >= 50
                            ? 'bg-warning'
                            : 'bg-danger'
                      }`}
                    >
                      {col.taxaConclusao.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-center numeric-cell">
                    {col.tempoMedioDias.toFixed(1)}
                  </td>
                  <td className="text-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`history-tooltip-${col.colaboradorId}`}>
                          Ver Histórico de Desempenho
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faHistory}
                        role="button"
                        onClick={() => onViewHistory(col.colaboradorId)}
                        className="action-icon"
                      />
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ColaboradorGlobalMetricsTable;
