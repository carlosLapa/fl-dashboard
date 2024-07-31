import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import TarefaList from './TarefaList';
import { updateTaskStatus } from '../../services/tarefaServiceKanban';
import { StatusType, Tarefa } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

const ProjetoKanbanBoard: React.FC<ProjetoKanbanBoardProps> = ({ projeto }) => {
  const STATUS_TYPES = [
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ] as const;

  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  useEffect(() => {
    console.log('Projeto tarefas:', projeto.tarefas);
    setTarefas(projeto.tarefas);
  }, [projeto]);

  const tasksByStatus = useMemo(() => {
    const result = STATUS_TYPES.reduce((acc, status) => {
      acc[status] = tarefas
        .filter((tarefa) => tarefa.status === status)
        .map((tarefa) => ({
          ...tarefa,
          projeto: { id: projeto.id, designacao: projeto.designacao },
          users: projeto.users,
        }));
      return acc;
    }, {} as Record<StatusType, Tarefa[]>);

    console.log('tasksByStatus:', result);
    return result;
  }, [tarefas, projeto, STATUS_TYPES]);

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

    const newTasks = Array.from(tarefas);
    const [reorderedTask] = newTasks.splice(source.index, 1);
    reorderedTask.status = destination.droppableId as StatusType;
    newTasks.splice(destination.index, 0, reorderedTask);

    setTarefas(newTasks);

    try {
      const updatedTask = await updateTaskStatus(
        Number(draggableId),
        destination.droppableId as StatusType
      );
      console.log('Task status updated:', updatedTask);
    } catch (error) {
      console.error('Failed to update task status', error);
      // Optionally revert the state if the API call fails
      setTarefas(tarefas);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        className="kanban-board"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        {STATUS_TYPES.map((status) => (
          <div key={status} style={{ flex: 1, margin: '0 10px' }}>
            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  key={status}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minHeight: '100px' }}
                >
                  <TarefaList
                    title={status}
                    tarefas={tasksByStatus[status] || []}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProjetoKanbanBoard;
