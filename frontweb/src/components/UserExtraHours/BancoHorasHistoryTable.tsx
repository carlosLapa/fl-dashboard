import React, { useMemo, useState } from 'react';
import { Badge, Card, Form, Table } from 'react-bootstrap';
import { UserExtraHoursDTO } from 'types/userExtraHours';
import './BancoHorasHistoryTable.scss';

interface BancoHorasHistoryTableProps {
  entries: UserExtraHoursDTO[];
}

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const ALL_MONTHS = 'all';

/**
 * Chronological, filterable listing of every entry logged for a collaborator.
 * Read-only: launching/editing entries stays in UserExtraHoursCalendar, this
 * is purely the "detailed, listed and organized" history view that was
 * missing before.
 */
const BancoHorasHistoryTable: React.FC<BancoHorasHistoryTableProps> = ({
  entries,
}) => {
  const availableYears = useMemo(() => {
    const years = new Set(entries.map((e) => Number(e.date.slice(0, 4))));
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [entries]);

  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_MONTHS);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((e) => Number(e.date.slice(0, 4)) === selectedYear)
      .filter(
        (e) =>
          selectedMonth === ALL_MONTHS ||
          Number(e.date.slice(5, 7)) === Number(selectedMonth),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, selectedYear, selectedMonth]);

  return (
    <Card className="banco-horas-history-table">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <Card.Title className="mb-0">Histórico de Lançamentos</Card.Title>
          <div className="d-flex gap-2">
            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value={ALL_MONTHS}>Todos os meses</option>
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              size="sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ width: 'auto' }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center text-muted py-5">
            Sem lançamentos neste período.
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th className="text-center">Tipo</th>
                  <th className="text-center">Horas</th>
                  <th>Comentário</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      {new Date(`${entry.date}T00:00:00`).toLocaleDateString(
                        'pt-PT',
                      )}
                    </td>
                    <td className="text-center">
                      <Badge bg={entry.hours >= 0 ? 'success' : 'danger'}>
                        {entry.hours >= 0 ? 'Extra' : 'Falta'}
                      </Badge>
                    </td>
                    <td className="text-center numeric-cell">
                      {entry.hours > 0 ? '+' : ''}
                      {entry.hours}h
                    </td>
                    <td>{entry.comment || '—'}</td>
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

export default BancoHorasHistoryTable;
