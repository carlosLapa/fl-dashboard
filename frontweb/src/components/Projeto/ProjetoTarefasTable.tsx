import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';
import { Tarefa, TarefaWithUserAndProjetoDTO } from '../../types/tarefa';

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

  const getStatusBadge = (status: string) => {
    let variant = 'secondary';

    switch (status) {
      case 'PENDENTE':
        variant = 'warning';
        break;
      case 'EM_PROGRESSO':
        variant = 'primary';
        break;
      case 'CONCLUIDO':
        variant = 'success';
        break;
      case 'CANCELADO':
        variant = 'danger';
        break;
    }

    return <Badge bg={variant}>{status.replace('_', ' ')}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    let variant = 'secondary';

    switch (prioridade) {
      case 'BAIXA':
        variant = 'info';
        break;
      case 'MEDIA':
        variant = 'warning';
        break;
      case 'ALTA':
        variant = 'danger';
        break;
    }

    return <Badge bg={variant}>{prioridade}</Badge>;
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
                    <td>{getPrioridadeBadge(tarefa.prioridade)}</td>
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
