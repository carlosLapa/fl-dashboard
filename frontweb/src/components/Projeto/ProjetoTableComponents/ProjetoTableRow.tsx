import React from 'react';
import { Projeto } from '../../../types/projeto';
import { User } from '../../../types/user';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from '../ProjetoStatusBadge';

interface ProjetoTableRowProps {
  projeto: Projeto;
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
}

const ProjetoTableRow: React.FC<ProjetoTableRowProps> = ({
  projeto,
  onEditProjeto,
  onDeleteProjeto,
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
    <tr>
      <td>{projeto.projetoAno}</td>
      <td>{projeto.designacao}</td>
      <td>{projeto.entidade}</td>
      <td>{projeto.prioridade}</td>
      <td className="d-none d-md-table-cell">{projeto.observacao}</td>
      <td>{formatDate(projeto.prazo)}</td>
      <td className="d-none d-lg-table-cell">
        {renderUserNames(projeto.users)}
      </td>
      <td>
        <ProjetoStatusBadge status={projeto.status} />
      </td>
      <td>
        <div className="action-icons">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${projeto.id}`}>Editar</Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faPencilAlt}
              onClick={() => onEditProjeto(projeto.id)}
              className="mr-2 edit-icon"
            />
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-delete-${projeto.id}`}>Apagar</Tooltip>
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
              <Tooltip id={`tooltip-kanban-${projeto.id}`}>
                Ver Kanban Board
              </Tooltip>
            }
          >
            <Link to={`/projetos/${projeto.id}/full`} className="view-icon">
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
              style={{ marginLeft: '2px' }}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </Link>
          </OverlayTrigger>
        </div>
      </td>
    </tr>
  );
};

export default ProjetoTableRow;
