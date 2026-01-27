import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
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

/**
 * Component displaying the top 10 longest tasks by working days
 * Shows task description, priority, start/end dates, and duration in working days
 * Data is pre-sorted by backend based on workingDays field
 */
const LongestTasksTable: React.FC<LongestTasksTableProps> = ({ metrics }) => {
  /**
   * Format ISO date string to Brazilian format (dd/MM/yyyy)
   * @param dateString - ISO date string from backend
   * @returns Formatted date or '-' if invalid
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  /**
   * Format working days with proper pluralization
   * @param days - Number of working days (from backend calculation)
   * @returns Formatted string (e.g., "5 dias úteis" or "1 dia útil")
   */
  const formatWorkingDays = (days?: number): string => {
    if (days === undefined || days === null) return '-';
    if (days === 0) return '0 dias';
    if (days === 1) return '1 dia útil';
    return `${days} dias úteis`;
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
                  <th className="text-center" style={{ width: '140px' }}>
                    Duração (úteis)
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.tarefasMaisLongas.map((tarefa, index) => (
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
                        {formatWorkingDays(tarefa.workingDays)}
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

export default LongestTasksTable;
