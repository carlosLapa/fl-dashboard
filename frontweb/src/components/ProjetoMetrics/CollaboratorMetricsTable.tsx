import React, { useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import './CollaboratorPerformanceChart.scss';

interface CollaboratorPerformanceChartProps {
  metrics: ProjetoMetricsDTO;
}

const CollaboratorPerformanceChart: React.FC<
  CollaboratorPerformanceChartProps
> = ({ metrics }) => {
  // Transform data for chart (top 10 collaborators)
  const chartData = useMemo(() => {
    return metrics.colaboradores
      .sort((a, b) => b.tarefasConcluidas - a.tarefasConcluidas)
      .slice(0, 10)
      .map((collab) => ({
        name: collab.colaboradorNome.split(' ')[0], // First name only
        fullName: collab.colaboradorNome,
        concluidas: collab.tarefasConcluidas,
        pendentes: collab.totalTarefas - collab.tarefasConcluidas,
        total: collab.totalTarefas,
      }));
  }, [metrics]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label fw-bold">{data.fullName}</p>
          <p className="text-success mb-1">Concluídas: {data.concluidas}</p>
          <p className="text-warning mb-1">Pendentes: {data.pendentes}</p>
          <p className="text-muted mb-0">Total: {data.total}</p>
        </div>
      );
    }
    return null;
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

  // Extract first name with fallback for undefined
  const getFirstName = (fullName: string | undefined): string => {
    if (!fullName) {
      return 'Desconhecido';
    }
    const firstName = fullName.split(' ')[0];
    return firstName || 'Desconhecido';
  };

  return (
    <Card className="collaborator-performance-chart">
      <Card.Body>
        <Card.Title className="mb-4">
          Performance dos Colaboradores
        </Card.Title>

        {chartData.length === 0 ? (
          <div className="text-center text-muted py-5">
            Nenhum colaborador encontrado
          </div>
        ) : (
          <>
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
                    <th className="text-center">Tempo Médio (dias)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCollaborators.length > 0 ? (
                    sortedCollaborators.map((col) => {
                      const completionRate =
                        col.totalTarefas > 0
                          ? (
                              (col.tarefasConcluidas / col.totalTarefas) *
                              100
                            ).toFixed(1)
                          : '0.0';

                      return (
                        <tr key={col.colaboradorId || Math.random()}>
                          <td>
                            <strong>{getFirstName(col.colaboradorNome)}</strong>
                          </td>
                          <td className="text-center">{col.totalTarefas}</td>
                          <td className="text-center text-success">
                            {col.tarefasConcluidas}
                          </td>
                          <td className="text-center text-warning">
                            {col.tarefasEmProgresso}
                          </td>
                          <td className="text-center text-danger">
                            {col.tarefasPendentes}
                          </td>
                          <td className="text-center">
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
                          <td className="text-center">
                            {col.tempoMedioDias.toFixed(1)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        Nenhum colaborador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default CollaboratorPerformanceChart;
