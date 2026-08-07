import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { CollaboratorGlobalMetricsDTO } from '../../types/colaboradorReport';
import './ColaboradorGlobalMetricsTable.scss';

interface ColaboradorGlobalMetricsTableProps {
  colaboradores: CollaboratorGlobalMetricsDTO[];
}

/**
 * Table showing collaborator performance metrics aggregated across ALL projects.
 * Data arrives pre-sorted by total tasks (descending) from the backend.
 */
const ColaboradorGlobalMetricsTable: React.FC<
  ColaboradorGlobalMetricsTableProps
> = ({ colaboradores }) => {
  return (
    <Card className="colaborador-global-metrics-table">
      <Card.Body>
        <Card.Title className="mb-4">Totais Gerais por Colaborador</Card.Title>

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
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ColaboradorGlobalMetricsTable;
