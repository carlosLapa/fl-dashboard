import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TarefaCard from './TarefaCard';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';

interface TarefaListProps {
  column: TarefaStatus;
  tarefas: KanbanTarefa[];
}

const TarefaList: React.FC<TarefaListProps> = ({ column, tarefas }) => {
  return (
    <div className="tarefa-list">
      <h2>{column}</h2>
      <Droppable droppableId={column}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="tarefa-list-content"
            style={{ minHeight: '100px' }}
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
              <div>No tasks in this column</div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TarefaList;
