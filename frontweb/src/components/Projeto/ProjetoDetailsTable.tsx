import React from 'react';
import { Form, Table } from 'react-bootstrap';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { Externo } from '../../types/externo';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import './ProjetoDetailsTable.scss';

interface ProjetoDetailsTableProps {
  projeto: Projeto;
  onStatusChange: (newStatus: string) => Promise<void>;
}

const ProjetoDetailsTable: React.FC<ProjetoDetailsTableProps> = ({
  projeto,
  onStatusChange,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Safely render user names, handling undefined or empty arrays
  const renderUserNames = (users?: User[]) => {
    if (!users || users.length === 0) return 'N/A';
    return users.map((user) => user.name).join(', ');
  };

  // Render external collaborators' names
  const renderExternoNames = (externos?: Externo[]) => {
    if (!externos || externos.length === 0) return 'N/A';
    return externos.map((externo) => externo.name).join(', ');
  };

  return (
    <div className="projeto-details-container">
      <div className="table-responsive">
        <Table striped bordered hover className="details-table">
          <tbody>
            <tr>
              <th>Ano</th>
              <td>{projeto.projetoAno}</td>
              <th>Designação</th>
              <td>{projeto.designacao}</td>
            </tr>
            <tr>
              <th>Cliente</th>
              <td>{projeto.cliente ? projeto.cliente.name : 'N/A'}</td>
              <th>Tipo</th>
              <td>{projeto.tipo || 'N/A'}</td>
            </tr>
            <tr>
              <th>Coordenador</th>
              <td>{projeto.coordenador ? projeto.coordenador.name : 'N/A'}</td>
              <th>Prazo</th>
              <td>{formatDate(projeto.prazo)}</td>
            </tr>
            <tr>
              <th>Data da Proposta</th>
              <td>{formatDate(projeto.dataProposta)}</td>
              <th>Data da Adjudicação</th>
              <td>{formatDate(projeto.dataAdjudicacao)}</td>
            </tr>
            <tr>
              <th>Prioridade</th>
              <td>{projeto.prioridade}</td>
              <th></th>
              <td></td>
            </tr>
            <tr>
              <th>Observação</th>
              <td colSpan={3}>{projeto.observacao}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td colSpan={3}>
                <div className="status-container">
                  <Form.Select
                    value={projeto.status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="status-select me-2"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="EM_PROGRESSO">Em Progresso</option>
                    <option value="CONCLUIDO">Concluído</option>
                    <option value="SUSPENSO">Suspenso</option>
                  </Form.Select>
                  <ProjetoStatusBadge status={projeto.status} />
                </div>
              </td>
            </tr>
            <tr>
              <th>Colaboradores</th>
              <td colSpan={3}>{renderUserNames(projeto.users)}</td>
            </tr>
            <tr>
              <th>Colaboradores Externos</th>
              <td colSpan={3}>{renderExternoNames(projeto.externos)}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ProjetoDetailsTable;
