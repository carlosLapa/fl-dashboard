import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import TarefaColumn from './TarefaColumn';
import { KanbanTarefa, TarefaStatus } from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import axios from 'axios';
import {
  getTarefaWithUsers,
  getColumnsForProject,
  updateTarefaStatus,
} from 'services/tarefaService';
import { ColunaWithProjetoDTO } from '../../types/coluna';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

function isTarefaStatus(status: any): status is TarefaStatus {
  return ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(
    status
  );
}

const ProjetoKanbanBoard: React.FC<ProjetoKanbanBoardProps> = ({ projeto }) => {
  const statusTranslations: { [key in TarefaStatus]: string } = {
    BACKLOG: 'Backlog',
    TODO: 'A Fazer',
    IN_PROGRESS: 'Em Progresso',
    IN_REVIEW: 'Em Revisão',
    DONE: 'Concluído',
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

  const [columnsOrder] = useState<TarefaStatus[]>([
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ]);

  useEffect(() => {
    const fetchColumnsAndTarefas = async () => {
      try {
        const fetchedColumns = await getColumnsForProject(projeto.id);
        const updatedColumns: { [key in TarefaStatus]: KanbanTarefa[] } = {
          BACKLOG: [],
          TODO: [],
          IN_PROGRESS: [],
          IN_REVIEW: [],
          DONE: [],
        };

        fetchedColumns.forEach((column: ColunaWithProjetoDTO) => {
          if (column.status in updatedColumns) {
            updatedColumns[column.status as TarefaStatus] = [];
          }
        });
        for (const tarefa of projeto.tarefas) {
          try {
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
              updatedColumns.BACKLOG.push(kanbanTarefa);
            }
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              continue;
            }
            throw error;
          }
        }

        setColumns(updatedColumns);
      } catch (error) {
        console.error('Error fetching columns and tarefas:', error);
      }
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

    const newColumns = {
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    };

    setColumns(newColumns);

    try {
      await updateTarefaStatus(
        removed.id,
        destination.droppableId as TarefaStatus
      );
    } catch (error) {
      console.error('Failed to update tarefa status:', error);
      setColumns(columns);
    }
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
