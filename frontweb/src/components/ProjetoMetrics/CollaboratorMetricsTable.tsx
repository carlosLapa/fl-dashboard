import React, { useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import './CollaboratorMetricsTable.scss';

interface CollaboratorMetricsTableProps {
  metrics: ProjetoMetricsDTO;
}

/**
 * Table component displaying detailed metrics for each collaborator
 * Shows total tasks, completion status, completion rate, and average working days
 * Sorted by completion rate (descending)
 */
const CollaboratorMetricsTable: React.FC<CollaboratorMetricsTableProps> = ({
  metrics,
}) => {
  /**
   * Extract first name with fallback for undefined/null values
   * @param fullName - Full name string
   * @returns First name or "Desconhecido"
   */
  const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) {
      return 'Desconhecido';
    }
    const firstName = fullName.split(' ')[0];
    return firstName || 'Desconhecido';
  };

  // Sort collaborators by completion rate (descending)
  const sortedCollaborators = useMemo(() => {
    return [...metrics.colaboradores].sort((a, b) => {
      const rateA =
        a.totalTarefas > 0 ? (a.tarefasConcluidas / a.totalTarefas) * 100 : 0;
      const rateB =
        b.totalTarefas > 0 ? (b.tarefasConcluidas / b.totalTarefas) * 100 : 0;
      return rateB - rateA;
    });
  }, [metrics.colaboradores]);

  return (
    <Card className="collaborator-metrics-table">
      <Card.Body>
        <Card.Title className="mb-4">
          Performance Geral dos Colaboradores
        </Card.Title>

        {sortedCollaborators.length === 0 ? (
          <div className="text-center text-muted py-5">
            Nenhum colaborador encontrado
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Concluídas</th>
                  <th className="text-center">Em Progresso</th>
                  <th className="text-center">Pendentes</th>
                  <th className="text-center">Taxa de Conclusão</th>
                  <th className="text-center">Tempo Médio (dias úteis)</th>
                </tr>
              </thead>
              <tbody>
                {sortedCollaborators.map((col) => {
                  const completionRate =
                    col.totalTarefas > 0
                      ? (
                          (col.tarefasConcluidas / col.totalTarefas) *
                          100
                        ).toFixed(1)
                      : '0.0';

                  return (
                    <tr key={col.colaboradorId}>
                      <td>
                        <strong>{getFirstName(col.colaboradorNome)}</strong>
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
                            Number(completionRate) >= 75
                              ? 'bg-success'
                              : Number(completionRate) >= 50
                                ? 'bg-warning'
                                : 'bg-danger'
                          }`}
                        >
                          {completionRate}%
                        </span>
                      </td>
                      <td className="text-center numeric-cell">
                        {col.tempoMedioDias.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CollaboratorMetricsTable;
