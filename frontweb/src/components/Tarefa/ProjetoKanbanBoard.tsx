import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import TarefaColumn from './TarefaColumn';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import {
  getTarefaWithUsers,
  getColumnsForProject,
  updateTarefaStatus,
} from 'services/tarefaService';
import { ColunaWithProjetoDTO } from '../../types/coluna';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

const ProjetoKanbanBoard: React.FC<ProjetoKanbanBoardProps> = ({ projeto }) => {
  const statusTranslations: { [key in TarefaStatus]: string } = {
    BACKLOG: 'Backlog',
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em Progresso',
    IN_REVIEW: 'Em Revisão',
    DONE: 'Concluído'
  };
  
  const [columns, setColumns] = useState<{
    [key in TarefaStatus]: KanbanTarefa[];
  }>({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  });

  const [columnsOrder, setColumnsOrder] = useState<TarefaStatus[]>([
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ]);

  useEffect(() => {
    const fetchColumnsAndTarefas = async () => {
      const fetchedColumns = await getColumnsForProject(projeto.id);
      const updatedColumns: { [key in TarefaStatus]: KanbanTarefa[] } = {
        BACKLOG: [],
        TODO: [],
        IN_PROGRESS: [],
        IN_REVIEW: [],
        DONE: [],
      };

      const updatedColumnsOrder: TarefaStatus[] = [
        'BACKLOG',
        'TODO',
        'IN_PROGRESS',
        'IN_REVIEW',
        'DONE',
      ];

      fetchedColumns.forEach((column: ColunaWithProjetoDTO) => {
        if (column.status in updatedColumns) {
          updatedColumns[column.status as TarefaStatus] = [];
        }
      });

      function isTarefaStatus(status: any): status is TarefaStatus {
        return ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(
          status
        );
      }

      for (const tarefa of projeto.tarefas) {
        const tarefaWithUsers = await getTarefaWithUsers(tarefa.id);
        const kanbanTarefa: KanbanTarefa = {
          ...tarefaWithUsers,
          column: tarefaWithUsers.status as TarefaStatus,
          projeto: { id: projeto.id, designacao: projeto.designacao },
          uniqueId: `${tarefa.id}-${Date.now()}`,
        };
        if (
          isTarefaStatus(kanbanTarefa.status) &&
          kanbanTarefa.status in updatedColumns
        ) {
          updatedColumns[kanbanTarefa.status].push(kanbanTarefa);
        } else {
          console.warn(
            `Unknown status: ${kanbanTarefa.status}. Moving task to BACKLOG.`
          );
          updatedColumns.BACKLOG.push(kanbanTarefa);
        }
      }

      setColumns(updatedColumns);
      setColumnsOrder(updatedColumnsOrder);
    };

    fetchColumnsAndTarefas();
  }, [projeto]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId as TarefaStatus];
    const destColumn = columns[destination.droppableId as TarefaStatus];
    const [removed] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    try {
      await updateTarefaStatus(
        removed.id,
        destination.droppableId as TarefaStatus
      );
    } catch (error) {
      console.error('Failed to update tarefa status:', error);
      // Optionally, revert the local state change if the API call fails
    }

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
            columnTitle={statusTranslations[columnId]}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default ProjetoKanbanBoard;
