import React, { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyProjectCountDTO } from '../../types/projetoUserHistory';
import './ProjectAssignmentTimelineChart.scss';

interface ProjectAssignmentTimelineChartProps {
  projetosAtivosPorMes: MonthlyProjectCountDTO[];
}

const LINE_COLOR = '#81a6f0';

const formatMonthLabel = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  return `${month}/${year}`;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { monthLabel: string; activeProjects: number } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const { monthLabel, activeProjects } = payload[0].payload;

  return (
    <div className="project-assignment-timeline-tooltip">
      <strong>{monthLabel}</strong>
      <div>Projetos ativos: {activeProjects}</div>
    </div>
  );
};

/**
 * Step-line chart of how many projects a collaborator was actively assigned
 * to, month by month, derived from the ADDED/REMOVED event history.
 */
const ProjectAssignmentTimelineChart: React.FC<
  ProjectAssignmentTimelineChartProps
> = ({ projetosAtivosPorMes }) => {
  const chartData = useMemo(
    () =>
      projetosAtivosPorMes.map((point) => ({
        monthLabel: formatMonthLabel(point.yearMonth),
        activeProjects: point.activeProjects,
      })),
    [projetosAtivosPorMes],
  );

  const maxActiveProjects = useMemo(
    () =>
      projetosAtivosPorMes.reduce(
        (max, point) => Math.max(max, point.activeProjects),
        0,
      ),
    [projetosAtivosPorMes],
  );

  return (
    <Card className="project-assignment-timeline-chart">
      <Card.Body>
        <Card.Title className="mb-4">Projetos Ativos por Mês</Card.Title>

        {projetosAtivosPorMes.length < 2 ? (
          <div className="text-center text-muted py-5">
            Ainda não há histórico suficiente para mostrar uma evolução.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
              <YAxis
                allowDecimals={false}
                domain={[0, Math.max(maxActiveProjects, 1)]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="stepAfter"
                dataKey="activeProjects"
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProjectAssignmentTimelineChart;
