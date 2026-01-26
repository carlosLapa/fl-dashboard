import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import { formatWorkingDays } from '../../services/projetoMetricsService';
import { format } from 'date-fns';
import './LongestTasksTable.scss';

interface LongestTasksTableProps {
  metrics: ProjetoMetricsDTO;
}

const PRIORITY_COLORS: Record<string, string> = {
  BAIXA: 'secondary',
  MEDIA: 'info',
  ALTA: 'warning',
  URGENTE: 'danger',
};

const LongestTasksTable: React.FC<LongestTasksTableProps> = ({ metrics }) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const calculateDuration = (startDate?: string, endDate?: string): number => {
    if (!startDate || !endDate) return 0;
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  return (
    <Card className="longest-tasks-table">
      <Card.Body>
        <Card.Title className="mb-4">Tarefas Mais Longas</Card.Title>

        {metrics.tarefasMaisLongas.length === 0 ? (
          <div className="text-center text-muted py-4">
            Nenhuma tarefa concluída encontrada
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '60px' }}>
                    #
                  </th>
                  <th>Descrição</th>
                  <th className="text-center" style={{ width: '120px' }}>
                    Prioridade
                  </th>
                  <th className="text-center" style={{ width: '120px' }}>
                    Início
                  </th>
                  <th className="text-center" style={{ width: '120px' }}>
                    Fim
                  </th>
                  <th className="text-center" style={{ width: '100px' }}>
                    Duração
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.tarefasMaisLongas.map((tarefa, index) => {
                  const duration = calculateDuration(
                    tarefa.dataInicio,
                    tarefa.dataFim,
                  );

                  return (
                    <tr key={tarefa.tarefaId}>
                      <td className="text-center text-muted fw-semibold">
                        {index + 1}
                      </td>
                      <td className="task-description">{tarefa.descricao}</td>
                      <td className="text-center">
                        <Badge
                          bg={PRIORITY_COLORS[tarefa.prioridade] || 'secondary'}
                        >
                          {tarefa.prioridade}
                        </Badge>
                      </td>
                      <td className="text-center text-muted">
                        {formatDate(tarefa.dataInicio)}
                      </td>
                      <td className="text-center text-muted">
                        {formatDate(tarefa.dataFim)}
                      </td>
                      <td className="text-center">
                        <span className="duration-badge">
                          {formatWorkingDays(duration)}
                        </span>
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

export default LongestTasksTable;
