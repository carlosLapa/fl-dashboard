import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  KanbanTarefa,
  KanbanTarefaWithProjectDeadline,
  TarefaStatus,
} from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faBriefcase,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { getDeadlineStatus } from '../../utils/dateUtils';
import './styles.scss';

interface TarefaCardProps {
  tarefa: KanbanTarefa;
  index: number;
}

const getStatusColor = (status: TarefaStatus) => {
  const colors: { [key in TarefaStatus]: string } = {
    BACKLOG: '#E2E8F0',
    TODO: '#FEF3C7',
    IN_PROGRESS: '#BFDBFE',
    IN_REVIEW: '#DDD6FE',
    DONE: '#BBF7D0',
  };
  return colors[status];
};

const getPriorityStyle = (priority: string) => {
  const styles: { [key: string]: { backgroundColor: string; color: string } } =
    {
      Alta: { backgroundColor: '#EF4444', color: '#FFFFFF' },
      Média: { backgroundColor: '#FBBF24', color: '#1F2937' },
      Baixa: { backgroundColor: '#34D399', color: '#1F2937' },
    };
  return {
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 500,
    ...styles[priority],
  };
};

// Function to get card style based on deadline status
const getCardStyle = (tarefa: KanbanTarefa): string => {
  // Cast to our extended interface that includes project deadline
  const tarefaWithPrazo = tarefa as KanbanTarefaWithProjectDeadline;

  // If we don't have a project deadline, we can't determine status
  if (!tarefaWithPrazo.projeto?.prazo) {
    return '';
  }

  const status = getDeadlineStatus(
    tarefa.prazoReal,
    tarefaWithPrazo.projeto.prazo
  );

  if (status.isOverdue) {
    return 'task-overdue';
  }

  if (status.isApproaching) {
    return status.daysRemaining !== null && status.daysRemaining <= 2
      ? 'task-critical'
      : 'task-approaching';
  }

  return '';
};

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT');
};

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, index }) => {
  // Cast to our extended interface that includes project deadline
  const tarefaWithPrazo = tarefa as KanbanTarefaWithProjectDeadline;
  const deadlineStatus = getDeadlineStatus(
    tarefa.prazoReal,
    tarefaWithPrazo.projeto?.prazo
  );
  const cardStyleClass = getCardStyle(tarefa);

  return (
    <Draggable draggableId={tarefa.uniqueId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: '12px',
            margin: '0 0 8px 0',
            borderRadius: '6px',
            backgroundColor: getStatusColor(tarefa.status),
            boxShadow: snapshot.isDragging
              ? '0 5px 10px rgba(0,0,0,0.2)'
              : '0 2px 4px rgba(0,0,0,0.1)',
            fontFamily: 'Roboto, sans-serif',
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
            opacity: snapshot.isDragging ? 0.9 : 1,
            ...provided.draggableProps.style,
          }}
          className={`tarefa-card-wrapper ${cardStyleClass}`}
        >
          <h3
            style={{ fontSize: '16px', marginBottom: '8px', color: '#1F2937' }}
            className="tarefa-title"
          >
            {tarefa.descricao}
          </h3>
          <div
            style={{ fontSize: '14px', color: '#4B5563' }}
            className="tarefa-content"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
              }}
              className="tarefa-meta"
            >
              <span style={getPriorityStyle(tarefa.prioridade)}>
                {tarefa.prioridade}
              </span>
              <span className="tarefa-date">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                Prazo: {formatDate(tarefa.prazoReal)}
                {/* Add deadline indicator */}
                {deadlineStatus.isApproaching && (
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`deadline-tooltip-${tarefa.id}`}>
                        {deadlineStatus.isOverdue
                          ? `Esta tarefa excede o prazo do projeto (${deadlineStatus.formattedProjectDate})`
                          : `Esta tarefa tem apenas ${deadlineStatus.daysRemaining} dia(s) até o prazo do projeto`}
                      </Tooltip>
                    }
                  >
                    <span
                      className={`deadline-badge ${
                        deadlineStatus.isOverdue
                          ? 'deadline-overdue'
                          : deadlineStatus.daysRemaining !== null &&
                            deadlineStatus.daysRemaining <= 2
                          ? 'deadline-critical'
                          : 'deadline-approaching'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="me-1"
                      />
                      {deadlineStatus.daysRemaining !== null
                        ? `${deadlineStatus.daysRemaining}d`
                        : '!'}
                    </span>
                  </OverlayTrigger>
                )}
              </span>
            </div>

            {/* Add working days information */}
            {tarefa.workingDays !== undefined && (
              <div
                className="tarefa-working-days"
                style={{ marginTop: '4px', fontSize: '13px' }}
              >
                <FontAwesomeIcon icon={faBriefcase} className="me-1" />
                {tarefa.workingDays} dia(s) útil(eis)
              </div>
            )}

            <div style={{ marginTop: '8px' }} className="tarefa-footer">
              <div className="tarefa-projeto">{tarefa.projeto.designacao}</div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#6B7280',
                  marginTop: '4px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                className="tarefa-users"
              >
                {tarefa.users && tarefa.users.length > 0
                  ? tarefa.users.map((user) => user.name).join(', ')
                  : 'Não atribuída'}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TarefaCard;
