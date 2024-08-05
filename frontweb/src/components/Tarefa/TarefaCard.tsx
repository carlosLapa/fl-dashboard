import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { KanbanTarefa } from '../../types/tarefa';

interface TarefaCardProps {
  tarefa: KanbanTarefa;
  index: number;
}

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, index }) => {
  return (
    <Draggable draggableId={tarefa.uniqueId} index={index}>
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
          <h3>{tarefa.descricao}</h3>
          <p>Status: {tarefa.status}</p>
          <p>Prioridade: {tarefa.prioridade}</p>
          <p>Prazo estimado: {tarefa.prazoEstimado}</p>
          <p>Prazo real: {tarefa.prazoReal}</p>
          <p>Projeto: {tarefa.projeto.designacao}</p>
          <p>
            Atribuição: {tarefa.users.map((user) => user.username).join(', ')}
          </p>
        </div>
      )}
    </Draggable>
  );
};

export default TarefaCard;
