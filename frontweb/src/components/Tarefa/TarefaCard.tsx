import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

interface TarefaCardProps {
  tarefa: KanbanTarefa;
  index: number;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT');
};

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

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, index }) => {
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
          className="tarefa-card-wrapper"
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
              </span>
            </div>

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
