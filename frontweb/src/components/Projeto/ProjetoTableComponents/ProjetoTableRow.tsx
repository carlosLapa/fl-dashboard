import React from 'react';
import { Projeto } from '../../../types/projeto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from '../ProjetoStatusBadge';
import { formatDate } from '../../../utils/dateUtils';

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
  // Updated to safely handle undefined users
  const renderUserNames = () => {
    if (!projeto.users || !Array.isArray(projeto.users)) {
      return 'N/A';
    }
    return projeto.users.map((user) => user.name).join(', ') || 'N/A';
  };

  return (
    <tr>
      <td>{projeto.projetoAno}</td>
      <td>{projeto.designacao}</td>
      <td>{projeto.cliente?.name || 'N/A'}</td>
      <td>{projeto.tipo || 'N/A'}</td>
      <td>{projeto.prioridade}</td>
      <td>{projeto.coordenador?.name || 'N/A'}</td>
      <td>{projeto.dataProposta ? formatDate(projeto.dataProposta) : 'N/A'}</td>
      <td>
        {projeto.dataAdjudicacao ? formatDate(projeto.dataAdjudicacao) : 'N/A'}
      </td>
      <td className="d-none d-md-table-cell">{projeto.observacao}</td>
      <td>{formatDate(projeto.prazo)}</td>
      <td className="d-none d-lg-table-cell">{renderUserNames()}</td>
      <td>
        <ProjetoStatusBadge status={projeto.status} />
      </td>
      <td>
        <div className="action-icons">
          {/* Edit Project */}
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

          {/* Delete Project */}
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

          {/* View Kanban Board */}
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

          {/* View Project Details */}
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

          {/* View Project Metrics */}
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-metrics-${projeto.id}`}>
                Ver Métricas do Projeto
              </Tooltip>
            }
          >
            <Link
              to={`/projetos/${projeto.id}/metrics`}
              className="metrics-icon"
              style={{ marginLeft: '2px' }}
            >
              <FontAwesomeIcon icon={faChartLine} />
            </Link>
          </OverlayTrigger>
        </div>
      </td>
    </tr>
  );
};

export default ProjetoTableRow;
