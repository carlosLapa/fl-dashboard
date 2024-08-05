import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import TarefaColumn from './TarefaColumn';
import { KanbanTarefa } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import { getTarefaWithUsers } from 'services/tarefaService';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

const ProjetoKanbanBoard: React.FC<ProjetoKanbanBoardProps> = ({ projeto }) => {
  const [columns, setColumns] = useState<{ [key: string]: KanbanTarefa[] }>({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  });

  const [columnsOrder] = useState<string[]>([
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ]);

  useEffect(() => {
    const fetchTarefasWithUsers = async () => {
      const updatedColumns: { [key: string]: KanbanTarefa[] } = {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        DONE: [],
      };

      for (const tarefa of projeto.tarefas) {
        const tarefaWithUsers = await getTarefaWithUsers(tarefa.id);
        const kanbanTarefa: KanbanTarefa = {
          ...tarefaWithUsers,
          column: 'BACKLOG',
          projeto: { id: projeto.id, designacao: projeto.designacao },
          uniqueId: `${tarefa.id}-${Date.now()}`,
        };
        updatedColumns[kanbanTarefa.column].push(kanbanTarefa);
      }

      setColumns(updatedColumns);
    };

    fetchTarefasWithUsers();
  }, [projeto]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const [removed] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {columnsOrder.map((columnId) => (
          <TarefaColumn
            key={columnId}
            columnId={columnId}
            tarefas={columns[columnId]}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProjetoKanbanBoard;
