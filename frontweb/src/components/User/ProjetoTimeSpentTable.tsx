import React, { useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';
import { ProjetoTimeSpentDTO } from '../../types/projetoUserHistory';
import './ProjetoTimeSpentTable.scss';

interface ProjetoTimeSpentTableProps {
  tempoPorProjeto: ProjetoTimeSpentDTO[];
}

const formatDias = (dias: number): string => {
  if (dias < 1) {
    return '< 1 dia';
  }
  const rounded = Math.round(dias);
  return rounded === 1 ? '1 dia' : `${rounded} dias`;
};

/**
 * Total time spent per project, derived from ADDED/REMOVED event pairs -
 * a project-membership duration, not to be confused with the task
 * completion-time metrics on ProjetoMetricsPage (different measurement:
 * how long assigned to the project vs. how long tasks take to finish).
 */
const ProjetoTimeSpentTable: React.FC<ProjetoTimeSpentTableProps> = ({
  tempoPorProjeto,
}) => {
  const sorted = useMemo(
    () => [...tempoPorProjeto].sort((a, b) => b.totalDias - a.totalDias),
    [tempoPorProjeto],
  );

  return (
    <Card className="projeto-time-spent-table">
      <Card.Body>
        <Card.Title className="mb-4">Tempo Total por Projeto</Card.Title>

        {sorted.length === 0 ? (
          <div className="text-center text-muted py-5">
            Ainda não há dados suficientes para calcular tempo por projeto.
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th className="text-center">Tempo Total</th>
                  <th className="text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((item) => (
                  <tr key={item.projetoId}>
                    <td>{item.projetoDesignacao}</td>
                    <td className="text-center numeric-cell">
                      {formatDias(item.totalDias)}
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          item.ativo ? 'bg-success' : 'bg-secondary'
                        }`}
                      >
                        {item.ativo ? 'Ativo' : 'Terminado'}
                      </span>
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

export default ProjetoTimeSpentTable;
