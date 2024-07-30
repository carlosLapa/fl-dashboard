import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import TaskList from './TaskList';
import {
  fetchTasksForProject,
  updateTaskStatus,
} from '../../services/taskService';
import { StatusType, Task } from '../../types/task';

interface ProjectKanbanBoardProps {
  projectId: number;
}

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  projectId,
}) => {
  const STATUS_TYPES = [
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ] as const;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const projectTasks = await fetchTasksForProject(projectId);
      setTasks(projectTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks);
    const [reorderedTask] = newTasks.splice(source.index, 1);
    reorderedTask.status = destination.droppableId as StatusType;
    newTasks.splice(destination.index, 0, reorderedTask);

    setTasks(newTasks);

    try {
      await updateTaskStatus(
        Number(draggableId),
        destination.droppableId as StatusType
      );
    } catch (error) {
      console.error('Failed to update task status', error);
      // Optionally revert the state if the API call fails
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board">
        {STATUS_TYPES.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <TaskList
                  title={status}
                  tasks={tasks.filter((task) => task.status === status)}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProjectKanbanBoard;
