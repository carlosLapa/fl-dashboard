import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { TarefaUserDetalheDTO } from '../../types/colaboradorReport';
import { TarefaStatus } from '../../types/tarefa';
import { TAREFA_STATUS_LABELS } from '../../constants/tarefaStatus';
import './TarefaUserDetalheTable.scss';

interface TarefaUserDetalheTableProps {
  tarefas: TarefaUserDetalheDTO[];
}

const getStatusBadge = (status: TarefaStatus) => {
  let variant = 'secondary';

  switch (status) {
    case 'BACKLOG':
      variant = 'secondary';
      break;
    case 'TODO':
      variant = 'warning';
      break;
    case 'IN_PROGRESS':
      variant = 'primary';
      break;
    case 'IN_REVIEW':
      variant = 'info';
      break;
    case 'DONE':
      variant = 'success';
      break;
  }

  return <Badge bg={variant}>{TAREFA_STATUS_LABELS[status]}</Badge>;
};

/**
 * Per-task breakdown for a single collaborator: task, project, status and
 * working days between prazoEstimado/prazoReal - the agreed proxy for "time
 * spent" (see project decision: hour-tracking was ruled out as impractical).
 * Rows arrive pre-sorted from the backend (prazoEstimado descending).
 */
const TarefaUserDetalheTable: React.FC<TarefaUserDetalheTableProps> = ({
  tarefas,
}) => {
  return (
    <Card className="tarefa-user-detalhe-table">
      <Card.Body>
        <Card.Title className="mb-4">Detalhe de Tarefas</Card.Title>

        {tarefas.length === 0 ? (
          <div className="text-center text-muted py-5">
            Ainda não há tarefas atribuídas a este colaborador.
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Tarefa</th>
                  <th>Projeto</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Dias Úteis</th>
                </tr>
              </thead>
              <tbody>
                {tarefas.map((tarefa) => (
                  <tr key={tarefa.tarefaId}>
                    <td>{tarefa.descricao}</td>
                    <td>{tarefa.projetoDesignacao}</td>
                    <td className="text-center">
                      {getStatusBadge(tarefa.status)}
                    </td>
                    <td className="text-center numeric-cell">
                      {tarefa.workingDays ?? '—'}
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

export default TarefaUserDetalheTable;
