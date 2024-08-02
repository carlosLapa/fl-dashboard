import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { KanbanTarefa } from '../../types/tarefa';

interface TarefaCardProps {
  task: KanbanTarefa;
  index: number;
}

const TarefaCard: React.FC<TarefaCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            userSelect: 'none',
            padding: 16,
            margin: '0 0 8px 0',
            minHeight: '50px',
            backgroundColor: 'white',
            ...provided.draggableProps.style,
          }}
        >
          <h3>{task.descricao}</h3>
          <p>Prioridade: {task.prioridade}</p>
          <p>Prazo estimado: {task.prazoEstimado}</p>
          <p>Prazo real: {task.prazoReal}</p>
          <p>Projeto: {task.projeto?.designacao}</p>
          <p>
            Atribuição: {task.users?.map((user) => user.username).join(', ')}
          </p>
        </div>
      )}
    </Draggable>
  );
};

export default TarefaCard;
