import React from 'react';
import { Projeto } from '../../../types/projeto';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
  faChartLine,
  faBoxArchive,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from '../ProjetoStatusBadge';
import ProjetoPrioridadeBadge from '../ProjetoPrioridadeBadge';
import { formatDate } from '../../../utils/dateUtils';
import { usePermissions } from '../../../hooks/usePermissions';
import { Permission } from '../../../permissions/rolePermissions';

interface ProjetoTableRowProps {
  projeto: Projeto;
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
  onArchiveProjeto: (id: number) => void;
  onReactivateProjeto: (id: number) => void;
}

const ProjetoTableRow: React.FC<ProjetoTableRowProps> = ({
  projeto,
  onEditProjeto,
  onDeleteProjeto,
  onArchiveProjeto,
  onReactivateProjeto,
}) => {
  const { hasPermission } = usePermissions();
  const canArchive = hasPermission(Permission.EDIT_PROJECT);
  // Updated to safely handle undefined users
  const renderUserNames = () => {
    if (!projeto.users || !Array.isArray(projeto.users)) {
      return 'N/A';
    }
    return projeto.users.map((user) => user.name).join(', ') || 'N/A';
  };

  // Mirrors TarefaTableRow's condition for its own "Arquivar" suggestion —
  // a CONCLUIDO project the user just hasn't gotten around to archiving yet.
  const pendingArchive = projeto.status === 'CONCLUIDO' && !projeto.arquivadaEm;

  return (
    <tr className={pendingArchive ? 'table-success' : undefined}>
      <td>{projeto.projetoAno}</td>
      <td>{projeto.designacao}</td>
      <td>{projeto.cliente?.name || 'N/A'}</td>
      <td>{projeto.tipo || 'N/A'}</td>
      <td><ProjetoPrioridadeBadge prioridade={projeto.prioridade} /></td>
      <td>{projeto.coordenador?.name || 'N/A'}</td>
      <td>{projeto.dataProposta ? formatDate(projeto.dataProposta) : 'N/A'}</td>
      <td>
        {projeto.dataAdjudicacao ? formatDate(projeto.dataAdjudicacao) : 'N/A'}
      </td>
      <td className="d-none d-md-table-cell">{projeto.observacao}</td>
      <td>{formatDate(projeto.prazo)}</td>
      <td className="d-none d-lg-table-cell">{renderUserNames()}</td>
      <td>
        <ProjetoStatusBadge
          status={projeto.status}
          arquivado={!!projeto.arquivadaEm}
        />
        {pendingArchive && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`pending-archive-tooltip-${projeto.id}`}>
                Projeto concluído — considere arquivá-lo
              </Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faBoxArchive}
              className="ms-2 text-success"
              style={{ cursor: 'pointer' }}
            />
          </OverlayTrigger>
        )}
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

          {/* Archive / Reactivate Project */}
          {canArchive && !projeto.arquivadaEm && projeto.status === 'CONCLUIDO' && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-archive-${projeto.id}`}>Arquivar</Tooltip>
              }
            >
              <FontAwesomeIcon
                icon={faBoxArchive}
                onClick={() => onArchiveProjeto(projeto.id)}
                className="mr-2 archive-icon"
              />
            </OverlayTrigger>
          )}
          {canArchive && projeto.arquivadaEm && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-reactivate-${projeto.id}`}>
                  Reativar
                </Tooltip>
              }
            >
              <FontAwesomeIcon
                icon={faBoxOpen}
                onClick={() => onReactivateProjeto(projeto.id)}
                className="mr-2 reactivate-icon"
              />
            </OverlayTrigger>
          )}

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
