import React, { useMemo } from 'react';
import { Card, Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { ProjetoUserHistoryEventDTO } from '../../types/projetoUserHistory';
import './ProjetoAssignmentHistoryTable.scss';

interface ProjetoAssignmentHistoryTableProps {
  eventos: ProjetoUserHistoryEventDTO[];
}

/**
 * Chronological list of ADDED/REMOVED project-assignment events, most
 * recent first. Data arrives sorted ascending from the backend.
 */
const ProjetoAssignmentHistoryTable: React.FC<
  ProjetoAssignmentHistoryTableProps
> = ({ eventos }) => {
  const eventosDescendentes = useMemo(
    () => [...eventos].reverse(),
    [eventos],
  );

  return (
    <Card className="projeto-assignment-history-table">
      <Card.Body>
        <Card.Title className="mb-4">Eventos de Atribuição</Card.Title>

        {eventosDescendentes.length === 0 ? (
          <div className="text-center text-muted py-5">
            Ainda não há eventos registados. O histórico só regista
            atribuições/remoções a partir de agora — não é possível
            reconstruir atribuições passadas.
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Projeto</th>
                  <th className="text-center">Ação</th>
                </tr>
              </thead>
              <tbody>
                {eventosDescendentes.map((evento) => (
                  <tr key={evento.id}>
                    <td>
                      {format(parseISO(evento.eventDate), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td>{evento.projetoDesignacao}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          evento.action === 'ADDED'
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {evento.action === 'ADDED' ? 'Adicionado' : 'Removido'}
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

export default ProjetoAssignmentHistoryTable;
