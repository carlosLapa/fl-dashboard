import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import TarefaPrioridadeBadge from '../Tarefa/TarefaPrioridadeBadge';
import {
  Tarefa,
  TarefaStatus,
  TarefaWithUserAndProjetoDTO,
} from '../../types/tarefa';
import { TAREFA_STATUS_LABELS } from '../../constants/tarefaStatus';

interface ProjetoTarefasTableProps {
  tarefas: Tarefa[] | TarefaWithUserAndProjetoDTO[];
}

const ProjetoTarefasTable: React.FC<ProjetoTarefasTableProps> = ({
  tarefas,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

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


  // Before using tarefas
  const tarefasSafe = tarefas ?? [];

  // Use tarefasSafe instead of tarefas
  // Example:
  if (tarefasSafe.length === 0) {
    return <div>Sem tarefas</div>;
  }

  return (
    <Card>
      <Card.Body>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Prazo Estimado</th>
                <th className="d-none d-md-table-cell">Prazo Real</th>
                <th className="d-none d-lg-table-cell">Atribuição</th>
              </tr>
            </thead>
            <tbody>
              {tarefasSafe.length > 0 ? (
                tarefasSafe.map((tarefa) => (
                  <tr key={tarefa.id}>
                    <td>{tarefa.descricao}</td>
                    <td>{getStatusBadge(tarefa.status)}</td>
                    <td><TarefaPrioridadeBadge prioridade={tarefa.prioridade} /></td>
                    <td>{formatDate(tarefa.prazoEstimado)}</td>
                    <td className="d-none d-md-table-cell">
                      {formatDate(tarefa.prazoReal)}
                    </td>
                    <td className="d-none d-lg-table-cell">
                      {tarefa.users && tarefa.users.length > 0
                        ? tarefa.users.map((user) => user.name).join(', ')
                        : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    Não existem tarefas associadas a este projeto.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjetoTarefasTable;
