import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { Task } from '../../types/task';

interface TaskListProps {
  title: string;
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks }) => {
  return (
    <div className="task-list">
      <h2>{title}</h2>
      <Droppable droppableId={title}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="task-list-content"
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskList;
