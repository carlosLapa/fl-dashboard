import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faExclamationTriangle,
  faBoxArchive,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaStatus,
} from '../../../types/tarefa';
import {
  formatDate,
  getDeadlineStatus,
  getTaskOverdueStatus,
  isTarefaOrphaned,
} from '../../../utils/dateUtils';
import TarefaPrioridadeBadge from '../TarefaPrioridadeBadge';
import { useSubtarefas } from '../../../hooks/useSubtarefas';
import { getTarefaStatusLabel } from '../../../constants/tarefaStatus';
import { getFrequenciaRecorrenciaLabel } from '../../../constants/frequenciaRecorrencia';

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
  const { isDividida, totalPercentual } = useSubtarefas(tarefa.id);

  // A shortened project prazo can leave a task's own dates stranded after
  // it, with none of the deadline badges above catching it (they only ever
  // compare against today, never against whether the project still covers
  // the task's dates at all).
  const orphaned = isTarefaOrphaned(tarefa, tarefa.projeto?.prazo);

  // Mirrors the condition TarefaModal uses to show its "Arquivar" button —
  // a DONE task the user just hasn't gotten around to archiving yet.
  const pendingArchive = tarefa.status === 'DONE' && !tarefa.arquivadaEm;

  // Orphaned dates are the more actionable/urgent signal, so they win if a
  // task is somehow both orphaned and done-but-unarchived.
  const rowClassName = orphaned
    ? 'table-warning'
    : pendingArchive
    ? 'table-success'
    : undefined;

  // Add this function to render deadline with warning indicators
  const renderDeadlineWithWarning = () => {
    if (!tarefa.prazoReal) return '-';

    // Debug logs to check the data
    console.log(`Task ${tarefa.id} - Task deadline:`, tarefa.prazoReal);
    console.log(`Task ${tarefa.id} - Project:`, tarefa.projeto);
    console.log(`Task ${tarefa.id} - Project deadline:`, tarefa.projeto?.prazo);

    // Use getDeadlineStatus from dateUtils
    const deadlineStatus = getDeadlineStatus(tarefa.prazoReal, tarefa.projeto?.prazo);

    console.log(`Task ${tarefa.id} - Deadline status:`, deadlineStatus);

    // A task whose own deadline has already passed takes priority over the
    // project-deadline-proximity badge above — it's the more urgent, more
    // actionable signal, and applies even without a project deadline set.
    const overdueStatus = getTaskOverdueStatus(tarefa.prazoReal, tarefa.status);

    return (
      <>
        {formatDate(tarefa.prazoReal)}

        {overdueStatus.isPastDue ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`deadline-tooltip-${tarefa.id}`}>
                {`O prazo desta tarefa (${overdueStatus.formattedTaskDate}) já passou há ${overdueStatus.daysOverdue} dia(s)`}
              </Tooltip>
            }
          >
            <Badge bg="danger" className="ms-2" style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
              Atrasada
            </Badge>
          </OverlayTrigger>
        ) : (
          deadlineStatus.isApproaching && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`deadline-tooltip-${tarefa.id}`}>
                  {deadlineStatus.isOverdue
                    ? `Esta tarefa excede o prazo do projeto (${deadlineStatus.formattedProjectDate})`
                    : `O prazo desta tarefa (${deadlineStatus.formattedTaskDate}) fica a apenas ${deadlineStatus.daysRemaining} dia(s) do prazo do projeto (${deadlineStatus.formattedProjectDate})`}
                </Tooltip>
              }
            >
              <Badge
                bg={
                  deadlineStatus.isOverdue ||
                  (deadlineStatus.daysRemaining !== null &&
                    deadlineStatus.daysRemaining <= 2)
                    ? 'danger'
                    : 'warning'
                }
                className="ms-2"
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="me-1"
                />
                {deadlineStatus.daysRemaining !== null
                  ? `${deadlineStatus.daysRemaining}d`
                  : '!'}
              </Badge>
            </OverlayTrigger>
          )
        )}
      </>
    );
  };

  return (
    <tr className={rowClassName}>
      <td>
        {tarefa.projeto ? (
          tarefa.projeto.designacao
        ) : (
          <span className="text-muted">Sem projeto</span>
        )}
      </td>
      <td>
        {tarefa.descricao}
        {tarefa.recorrente && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`recorrente-tooltip-${tarefa.id}`}>
                Tarefa recorrente
                {tarefa.frequenciaRecorrencia
                  ? ` (${getFrequenciaRecorrenciaLabel(tarefa.frequenciaRecorrencia)})`
                  : ''}
              </Tooltip>
            }
          >
            <Badge bg="info" text="dark" className="ms-2">
              <FontAwesomeIcon icon={faSyncAlt} />
            </Badge>
          </OverlayTrigger>
        )}
        {orphaned && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`orphaned-tooltip-${tarefa.id}`}>
                As datas desta tarefa ficam além do prazo atual do projeto
                {tarefa.projeto?.prazo &&
                  ` (${formatDate(tarefa.projeto.prazo)})`}
                . Reveja as datas.
              </Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="ms-2 text-warning"
              style={{ cursor: 'pointer' }}
            />
          </OverlayTrigger>
        )}
      </td>
      <td>
        {getTarefaStatusLabel(tarefa.status)}
        {pendingArchive && (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`pending-archive-tooltip-${tarefa.id}`}>
                Tarefa concluída — considere arquivá-la
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
      <td><TarefaPrioridadeBadge prioridade={tarefa.prioridade} /></td>
      <td className="prazo-column">
        {tarefa.prazoEstimado ? formatDate(tarefa.prazoEstimado) : '-'}
      </td>
      <td className="prazo-column">{renderDeadlineWithWarning()}</td>
      <td className="prazo-column">
        {tarefa.workingDays != null
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
      <td>
        {isDividida ? (
          <Badge
            bg={
              totalPercentual >= 100
                ? 'success'
                : totalPercentual >= 50
                ? 'warning'
                : 'danger'
            }
          >
            {totalPercentual}%
          </Badge>
        ) : (
          '-'
        )}
      </td>

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
