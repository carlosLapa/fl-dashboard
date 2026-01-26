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
  Cell,
} from 'recharts';
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

  return (
    <Card className="collaborator-performance-chart">
      <Card.Body>
        <Card.Title className="mb-4">
          Performance dos Colaboradores (Top 10)
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
