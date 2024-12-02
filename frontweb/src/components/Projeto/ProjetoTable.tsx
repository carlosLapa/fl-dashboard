import React from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import './ProjetoTable.css';

export interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (projeto: Projeto) => void;
  onDeleteProjeto: (projetoId: number) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
  onDeleteProjeto,
  statusFilter = 'ALL',
  onStatusFilterChange = () => {},
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
    <div className="projeto-container">
      <Form.Group className="mb-3">
        <Form.Label>Filtrar por Status</Form.Label>
        <Form.Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="ALL">Todos</option>
          <option value="ATIVO">Ativo</option>
          <option value="EM_PROGRESSO">Em Progresso</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="SUSPENSO">Suspenso</option>
        </Form.Select>
      </Form.Group>
      {projetos.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Designação</th>
              <th>Entidade</th>
              <th>Prioridade</th>
              <th>Observação</th>
              <th>Prazo</th>
              <th>Colaboradores</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {projetos.map((projeto) => (
              <tr key={projeto.id}>
                <td>{projeto.projetoAno}</td>
                <td>{projeto.designacao}</td>
                <td>{projeto.entidade}</td>
                <td>{projeto.prioridade}</td>
                <td>{projeto.observacao}</td>
                <td>{formatDate(projeto.prazo)}</td>
                <td>{renderUserNames(projeto.users)}</td>
                <td>
                  <ProjetoStatusBadge status={projeto.status} />
                </td>
                <td>
                  <div className="action-icons">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-${projeto.id}`}>Editar</Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faPencilAlt}
                        onClick={() => onEditProjeto(projeto)}
                        className="mr-2 edit-icon"
                      />
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-${projeto.id}`}>Apagar</Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        onClick={() => onDeleteProjeto(projeto.id)}
                        className="delete-icon"
                      />
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-${projeto.id}`}>
                          Ver Kanban Board
                        </Tooltip>
                      }
                    >
                      <Link
                        to={`/projetos/${projeto.id}/full`}
                        className="view-icon"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-details-${projeto.id}`}>
                          Ver Detalhes do Projeto
                        </Tooltip>
                      }
                    >
                      <Link
                        to={`/projetos/${projeto.id}/details`}
                        className="info-icon"
                        style={{ marginLeft: '12px' }}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} />
                      </Link>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Não foram encontrados projetos.</p>
      )}
    </div>
  );
};

export default ProjetoTable;
