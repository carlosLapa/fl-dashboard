import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TarefaCard from './TarefaCard';
import { Tarefa } from '../../types/tarefa';

interface TarefaListProps {
  title: string;
  tarefas: Tarefa[];
}

const TarefaList: React.FC<TarefaListProps> = ({ title, tarefas }) => {
  return (
    <div className="tarefa-list">
      <h2>{title}</h2>
      <Droppable droppableId={title}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="tarefa-list-content"
            style={{ minHeight: '100px' }}
          >
            {tarefas.length > 0 ? (
              tarefas.map((tarefa, index) => (
                <TarefaCard key={tarefa.id} tarefa={tarefa} index={index} />
              ))
            ) : (
              <div>No tasks in this status</div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TarefaList;
