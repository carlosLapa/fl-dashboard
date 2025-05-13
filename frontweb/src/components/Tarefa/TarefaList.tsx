import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TarefaCard from './TarefaCard';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';
import { Badge } from 'react-bootstrap';
import './styles.scss';

interface TarefaListProps {
  column: TarefaStatus;
  tarefas: KanbanTarefa[];
}

const TarefaList: React.FC<TarefaListProps> = ({ column, tarefas }) => {
  // Get column title based on status
  const getColumnTitle = (status: TarefaStatus) => {
    switch (status) {
      case 'BACKLOG':
        return 'Backlog';
      case 'TODO':
        return 'A Fazer';
      case 'IN_PROGRESS':
        return 'Em Progresso';
      case 'IN_REVIEW':
        return 'Em Revisão';
      case 'DONE':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="column-title">{getColumnTitle(column)}</h3>
          <Badge bg="secondary" pill>
            {tarefas.length}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="column-content"
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? 'rgba(0, 0, 0, 0.02)'
                : 'transparent',
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
              <div className="empty-column-message">Sem tarefas</div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TarefaList;
