import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaStatus,
} from '../../../types/tarefa';
import { formatDate } from '../../../utils/dateUtils';

interface TarefaTableRowProps {
  tarefa: TarefaWithUserAndProjetoDTO;
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  onStatusChange?: (tarefaId: number, newStatus: TarefaStatus) => void;
}

const TarefaTableRow: React.FC<TarefaTableRowProps> = ({
  tarefa,
  onEditTarefa,
  onDeleteTarefa,
  onViewDetails,
  onStatusChange,
}) => {
  return (
    <tr>
      <td>{tarefa.descricao}</td>
      <td>{tarefa.status}</td>
      <td className="prazo-column">
        {tarefa.prazoEstimado ? formatDate(tarefa.prazoEstimado) : '-'}
      </td>
      <td className="prazo-column">
        {tarefa.prazoReal ? formatDate(tarefa.prazoReal) : '-'}
      </td>
      <td className="prazo-column">
        {tarefa.workingDays !== undefined
          ? `${tarefa.workingDays} dia(s)`
          : '-'}
      </td>
      <td>
        {tarefa.users && tarefa.users.length > 0
          ? tarefa.users.map((user) => user.name).join(', ')
          : '-'}
      </td>
      <td>
        {/* Display externos if they exist */}
        {tarefa.externos && tarefa.externos.length > 0
          ? tarefa.externos.map((externo) => externo.name).join(', ')
          : '-'}
      </td>
      <td>{tarefa.projeto.designacao}</td>
      <td>
        <div className="action-icons">
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`edit-tooltip-${tarefa.id}`}>Editar</Tooltip>}
          >
            <FontAwesomeIcon
              icon={faPencilAlt}
              onClick={() => onEditTarefa(tarefa.id)}
              className="action-icon edit-icon"
              style={{ marginRight: '8px' }}
            />
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`delete-tooltip-${tarefa.id}`}>Apagar</Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faTrashAlt}
              onClick={() => onDeleteTarefa(tarefa.id)}
              className="action-icon delete-icon"
              style={{ marginRight: '8px' }}
            />
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`details-tooltip-${tarefa.id}`}>
                Ver Detalhes
              </Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faInfoCircle}
              onClick={() => onViewDetails(tarefa.id)}
              className="action-icon view-details-icon"
            />
          </OverlayTrigger>
        </div>
      </td>
    </tr>
  );
};

export default TarefaTableRow;
