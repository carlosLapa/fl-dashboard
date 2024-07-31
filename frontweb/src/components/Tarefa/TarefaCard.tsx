import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Tarefa } from '../../types/tarefa';

interface TarefaCardProps {
  tarefa: Tarefa;
  index: number;
}

const TarefaCard: React.FC<TarefaCardProps> = ({ tarefa, index }) => {
  return (
    <Draggable draggableId={tarefa.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="tarefa-card"
        >
          <h3>{tarefa.descricao}</h3>
          <p>Status: {tarefa.status}</p>
          <p>Prioridade: {tarefa.prioridade}</p>
          <p>Prazo estimado: {tarefa.prazoEstimado}</p>
          <p>Prazo real: {tarefa.prazoReal}</p>
          <p>Projeto: {tarefa.projeto.designacao}</p>
          <p>
            Astribuição: {tarefa.users.map((user) => user.username).join(', ')}
          </p>
        </div>
      )}
    </Draggable>
  );
};

export default TarefaCard;
