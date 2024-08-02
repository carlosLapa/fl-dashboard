import React from 'react';
import { StrictModeDroppable } from '../../util/strickModeDroppable';
import TarefaCard from './TarefaCard';
import { KanbanTarefa } from '../../types/tarefa';

interface TarefaColumnProps {
  columnId: string;
  tasks: KanbanTarefa[];
}

const TarefaColumn: React.FC<TarefaColumnProps> = ({ columnId, tasks }) => {
  return (
    <div style={{ margin: '8px', minWidth: '250px' }}>
      <h2>{columnId}</h2>
      <StrictModeDroppable droppableId={columnId}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              minHeight: '500px',
              backgroundColor: '#f4f5f7',
              padding: '8px',
            }}
          >
            {tasks.map((task, index) => (
              <TarefaCard key={task.uniqueId} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default TarefaColumn;
