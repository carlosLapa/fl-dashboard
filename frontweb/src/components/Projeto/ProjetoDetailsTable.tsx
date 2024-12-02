import React from 'react';
import { Table } from 'react-bootstrap';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import ProjetoStatusBadge from './ProjetoStatusBadge';

interface ProjetoDetailsTableProps {
  projeto: Projeto;
}

const ProjetoDetailsTable: React.FC<ProjetoDetailsTableProps> = ({
  projeto,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderUserNames = (users: User[]) => {
    return users.map((user) => user.name).join(', ');
  };

  return (
    <Table striped bordered hover className="projeto-details-table">
      <tbody>
        <tr>
          <th className="detail-label">Ano</th>
          <td className="detail-value">{projeto.projetoAno}</td>
        </tr>
        <tr>
          <th className="detail-label">Designação</th>
          <td className="detail-value">{projeto.designacao}</td>
        </tr>
        <tr>
          <th className="detail-label">Entidade</th>
          <td className="detail-value">{projeto.entidade}</td>
        </tr>
        <tr>
          <th className="detail-label">Prioridade</th>
          <td className="detail-value">{projeto.prioridade}</td>
        </tr>
        <tr>
          <th className="detail-label">Observação</th>
          <td className="detail-value">{projeto.observacao}</td>
        </tr>
        <tr>
          <th className="detail-label">Prazo</th>
          <td className="detail-value">{formatDate(projeto.prazo)}</td>
        </tr>
        <tr>
          <th className="detail-label">Status</th>
          <td className="detail-value">
            <ProjetoStatusBadge status={projeto.status} />
          </td>
        </tr>
        <tr>
          <th className="detail-label">Colaboradores</th>
          <td className="detail-value">{renderUserNames(projeto.users)}</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default ProjetoDetailsTable;
