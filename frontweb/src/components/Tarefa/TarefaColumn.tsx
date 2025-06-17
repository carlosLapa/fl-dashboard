import React from 'react';
import { StrictModeDroppable } from '../../utils/strickModeDroppable';
import TarefaCard from './TarefaCard';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';
import { Badge } from 'react-bootstrap';
import './styles.scss';

interface TarefaColumnProps {
  columnId: TarefaStatus;
  tarefas: KanbanTarefa[];
  columnTitle: string;
}

const TarefaColumn: React.FC<TarefaColumnProps> = ({ 
  columnId, 
  tarefas, 
  columnTitle 
}) => {
  // Get column background color based on status
  const getColumnHeaderColor = (status: TarefaStatus) => {
    switch (status) {
      case 'BACKLOG':
        return '#E2E8F0';
      case 'TODO':
        return '#FEF3C7';
      case 'IN_PROGRESS':
        return '#BFDBFE';
      case 'IN_REVIEW':
        return '#DDD6FE';
      case 'DONE':
        return '#BBF7D0';
      default:
        return '#F8F9FA';
    }
  };

  return (
    <div className="kanban-column">
      <div 
        className="column-header" 
        style={{ backgroundColor: getColumnHeaderColor(columnId) }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="column-title">{columnTitle}</h3>
          <Badge bg="secondary" pill>
            {tarefas.length}
          </Badge>
        </div>
      </div>
      
      <StrictModeDroppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="column-content"
            style={{ 
              backgroundColor: snapshot.isDraggingOver 
                ? 'rgba(0, 0, 0, 0.02)' 
                : 'transparent'
            }}
          >
            {tarefas.length > 0 ? (
              tarefas.map((tarefa, index) => (
                <TarefaCard 
                  key={tarefa.uniqueId} 
                  tarefa={tarefa} 
                  index={index} 
                />
              ))
            ) : (
              <div className="empty-column-message">
                Sem tarefas
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default TarefaColumn;
