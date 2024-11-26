import React from 'react';
import { StrictModeDroppable } from '../../util/strickModeDroppable';
import TarefaCard from './TarefaCard';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';

interface TarefaColumnProps {
  columnId: TarefaStatus;
  tarefas: KanbanTarefa[];
  columnTitle: string;
}

const TarefaColumn: React.FC<TarefaColumnProps> = ({ columnId, tarefas, columnTitle }) => {
  return (
    <div style={{ margin: '8px', minWidth: '250px' }}>
      <h2>{columnTitle}</h2>
      <StrictModeDroppable droppableId={columnId}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              minHeight: '500px',
              backgroundColor: '#f7f7f7',
              padding: '8px',
            }}
          >
            {tarefas.map((tarefa, index) => (
              <TarefaCard key={tarefa.uniqueId} tarefa={tarefa} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </StrictModeDroppable>
    </div>
  );
};

export default TarefaColumn;
