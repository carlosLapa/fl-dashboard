import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="task-card"
        >
          <h3>{task.descricao}</h3>
          <p>Status: {task.status}</p>
          <p>Priority: {task.prioridade}</p>
          <p>Estimated Deadline: {task.prazoEstimado}</p>
          <p>Real Deadline: {task.prazoReal}</p>
          <p>Project: {task.projeto.nome}</p>
          <p>
            Assigned Users: {task.users.map((user) => user.username).join(', ')}
          </p>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
