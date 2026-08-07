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
import { format, parseISO } from 'date-fns';
import { ProjetoMetricsSnapshotDTO } from '../../types/projetoMetricsSnapshot';
import './MetricsHistoryChart.scss';

interface MetricsHistoryChartProps {
  snapshots: ProjetoMetricsSnapshotDTO[];
}

const LINE_COLOR = '#81a6f0';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { dateLabel: string; taxaConclusao: number } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const { dateLabel, taxaConclusao } = payload[0].payload;

  return (
    <div className="metrics-history-tooltip">
      <strong>{dateLabel}</strong>
      <div>Taxa de conclusão: {taxaConclusao.toFixed(1)}%</div>
    </div>
  );
};

/**
 * Line chart of completion rate across snapshots, so trends (e.g. "January
 * vs. August") become visible. Deliberately a single metric/single axis -
 * tempoMedioDias isn't on a 0-100 scale, so it's shown separately in
 * MetricsComparisonPanel rather than sharing this axis.
 */
const MetricsHistoryChart: React.FC<MetricsHistoryChartProps> = ({
  snapshots,
}) => {
  const chartData = useMemo(
    () =>
      snapshots.map((snapshot) => ({
        dateLabel: format(parseISO(snapshot.snapshotDate), 'dd/MM/yyyy'),
        taxaConclusao: snapshot.taxaConclusao,
      })),
    [snapshots],
  );

  return (
    <Card className="metrics-history-chart">
      <Card.Body>
        <Card.Title className="mb-4">Evolução da Taxa de Conclusão</Card.Title>

        {snapshots.length < 2 ? (
          <div className="text-center text-muted py-5">
            Ainda não há snapshots suficientes para mostrar uma evolução.
            Cria snapshots regularmente para começares a ver tendências aqui.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="taxaConclusao"
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

export default MetricsHistoryChart;
