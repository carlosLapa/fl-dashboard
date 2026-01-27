import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import './CollaboratorPerformanceChart.scss';

interface CollaboratorPerformanceChartProps {
  metrics: ProjetoMetricsDTO;
}

/**
 * Component displaying a bar chart of completed vs pending tasks per collaborator
 * Shows top 10 collaborators by completed tasks count
 * Uses initials format (e.g., "João S.") to avoid ambiguity with duplicate first names
 */
const CollaboratorPerformanceChart: React.FC<
  CollaboratorPerformanceChartProps
> = ({ metrics }) => {
  /**
   * Format collaborator name to "FirstName LastInitial." format
   * Handles edge cases (single name, missing surname, undefined)
   *
   * Examples:
   * - "João Silva" → "João S."
   * - "Maria Costa Pereira" → "Maria P." (uses last word)
   * - "Pedro" → "Pedro" (no surname)
   * - undefined → "Desconhecido"
   *
   * @param fullName - Complete name of collaborator
   * @returns Formatted name with initials
   */
  const formatNameWithInitials = (fullName: string | undefined): string => {
    if (!fullName) {
      return 'Desconhecido';
    }

    const nameParts = fullName
      .trim()
      .split(' ')
      .filter((part) => part.length > 0);

    if (nameParts.length === 0) {
      return 'Desconhecido';
    }

    if (nameParts.length === 1) {
      // Single name (e.g., "João")
      return nameParts[0];
    }

    // First name + last name initial
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[nameParts.length - 1][0].toUpperCase();

    return `${firstName} ${lastNameInitial}.`;
  };

  // Transform data for chart (top 10 collaborators by completed tasks)
  const chartData = useMemo(() => {
    return metrics.colaboradores
      .sort((a, b) => b.tarefasConcluidas - a.tarefasConcluidas)
      .slice(0, 10)
      .map((collab) => ({
        name: formatNameWithInitials(collab.colaboradorNome),
        fullName: collab.colaboradorNome || 'Desconhecido',
        concluidas: collab.tarefasConcluidas,
        pendentes: collab.totalTarefas - collab.tarefasConcluidas,
        total: collab.totalTarefas,
      }));
  }, [metrics]);

  /**
   * Custom tooltip displaying full name and task breakdown
   */
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

  return (
    <Card className="collaborator-performance-chart">
      <Card.Body>
        <Card.Title className="mb-4">
          Tarefas Concluídas e Pendentes por Colaborador
        </Card.Title>

        {chartData.length === 0 ? (
          <div className="text-center text-muted py-5">
            Nenhum colaborador encontrado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="concluidas"
                fill="#28a745"
                name="Concluídas"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="pendentes"
                fill="#ffc107"
                name="Pendentes"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default CollaboratorPerformanceChart;
