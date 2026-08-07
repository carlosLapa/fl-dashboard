import React, { useMemo, useState, useEffect } from 'react';
import { Card, Form, Row, Col, Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { ProjetoMetricsSnapshotDTO } from '../../types/projetoMetricsSnapshot';
import './MetricsComparisonPanel.scss';

interface MetricsComparisonPanelProps {
  snapshots: ProjetoMetricsSnapshotDTO[];
}

interface ComparisonRow {
  label: string;
  valueA: string;
  valueB: string;
  delta: number;
  deltaLabel: string;
  /** Whether a positive delta should be shown as an improvement (green). */
  higherIsBetter: boolean;
}

const formatDateOption = (isoDate: string): string =>
  format(parseISO(isoDate), 'dd/MM/yyyy');

/**
 * Lets the user pick two existing snapshots and compares their KPIs side by
 * side (e.g. "Taxa de conclusão: 62% -> 78% (+16pp)"). Uses a <select> of
 * the actual snapshot dates rather than a free date picker, since only
 * specific dates have data.
 */
const MetricsComparisonPanel: React.FC<MetricsComparisonPanelProps> = ({
  snapshots,
}) => {
  const [dateA, setDateA] = useState<string>('');
  const [dateB, setDateB] = useState<string>('');

  useEffect(() => {
    if (snapshots.length >= 2) {
      setDateA(snapshots[0].snapshotDate);
      setDateB(snapshots[snapshots.length - 1].snapshotDate);
    }
  }, [snapshots]);

  const snapshotA = useMemo(
    () => snapshots.find((s) => s.snapshotDate === dateA),
    [snapshots, dateA],
  );
  const snapshotB = useMemo(
    () => snapshots.find((s) => s.snapshotDate === dateB),
    [snapshots, dateB],
  );

  const rows: ComparisonRow[] = useMemo(() => {
    if (!snapshotA || !snapshotB) {
      return [];
    }

    const buildRow = (
      label: string,
      a: number,
      b: number,
      formatValue: (n: number) => string,
      higherIsBetter: boolean,
    ): ComparisonRow => {
      const delta = b - a;
      const sign = delta > 0 ? '+' : '';
      return {
        label,
        valueA: formatValue(a),
        valueB: formatValue(b),
        delta,
        deltaLabel: `${sign}${formatValue(delta)}`,
        higherIsBetter,
      };
    };

    return [
      buildRow(
        'Taxa de Conclusão',
        snapshotA.taxaConclusao,
        snapshotB.taxaConclusao,
        (n) => `${n.toFixed(1)}%`,
        true,
      ),
      buildRow(
        'Tempo Médio (dias úteis)',
        snapshotA.tempoMedioDias,
        snapshotB.tempoMedioDias,
        (n) => n.toFixed(1),
        false,
      ),
      buildRow(
        'Total de Tarefas',
        snapshotA.totalTarefas,
        snapshotB.totalTarefas,
        (n) => `${n}`,
        true,
      ),
      buildRow(
        'Tarefas Concluídas',
        snapshotA.tarefasConcluidas,
        snapshotB.tarefasConcluidas,
        (n) => `${n}`,
        true,
      ),
    ];
  }, [snapshotA, snapshotB]);

  if (snapshots.length < 2) {
    return null;
  }

  return (
    <Card className="metrics-comparison-panel">
      <Card.Body>
        <Card.Title className="mb-4">Comparar Snapshots</Card.Title>

        <Row className="g-3 mb-4">
          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label>De</Form.Label>
              <Form.Select
                value={dateA}
                onChange={(e) => setDateA(e.target.value)}
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.snapshotDate}>
                    {formatDateOption(s.snapshotDate)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} sm={6}>
            <Form.Group>
              <Form.Label>Até</Form.Label>
              <Form.Select
                value={dateB}
                onChange={(e) => setDateB(e.target.value)}
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.snapshotDate}>
                    {formatDateOption(s.snapshotDate)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {rows.length > 0 && (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th className="text-center">{formatDateOption(dateA)}</th>
                  <th className="text-center">{formatDateOption(dateB)}</th>
                  <th className="text-center">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isImprovement = row.higherIsBetter
                    ? row.delta > 0
                    : row.delta < 0;
                  const isWorse = row.higherIsBetter
                    ? row.delta < 0
                    : row.delta > 0;

                  return (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className="text-center numeric-cell">
                        {row.valueA}
                      </td>
                      <td className="text-center numeric-cell">
                        {row.valueB}
                      </td>
                      <td
                        className={`text-center numeric-cell ${
                          isImprovement
                            ? 'text-success'
                            : isWorse
                              ? 'text-danger'
                              : 'text-muted'
                        }`}
                      >
                        {row.deltaLabel}
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

export default MetricsComparisonPanel;
