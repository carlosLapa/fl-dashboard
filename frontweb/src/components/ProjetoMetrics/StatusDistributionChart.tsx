import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { ProjetoMetricsDTO } from '../../types/projetoMetrics';
import { getStatusLabel } from '../../services/projetoMetricsService';
import './StatusDistributionChart.scss';

interface StatusDistributionChartProps {
  metrics: ProjetoMetricsDTO;
}

const STATUS_COLORS: Record<string, string> = {
  BACKLOG: '#6c757d',
  TODO: '#17a2b8',
  IN_PROGRESS: '#ffc107',
  IN_REVIEW: '#fd7e14',
  DONE: '#28a745',
};

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
  metrics,
}) => {
  // Transform backend data to chart format
  const chartData = useMemo(() => {
    return Object.entries(metrics.tarefasPorStatus)
      .filter(([_, count]) => count > 0) // Only show statuses with tasks
      .map(([status, count]) => ({
        name: getStatusLabel(status),
        value: count,
        status: status,
        percentage:
          metrics.totalTarefas > 0
            ? ((count / metrics.totalTarefas) * 100).toFixed(1)
            : '0.0',
      }));
  }, [metrics]);

  // Custom label for pie slices
  const renderCustomLabel = ({ percentage }: any) => {
    return `${percentage}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${data.name}: ${data.value} tarefas`}</p>
          <p className="percentage">{`${data.percentage}% do total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="status-distribution-chart">
      <Card.Body>
        <Card.Title className="mb-4">Distribuição por Status</Card.Title>

        {chartData.length === 0 ? (
          <div className="text-center text-muted py-5">
            Nenhuma tarefa encontrada neste projeto
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.status] || '#6c757d'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) =>
                  `${value}: ${entry.payload.value}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatusDistributionChart;
