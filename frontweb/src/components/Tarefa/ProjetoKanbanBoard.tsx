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
import { Spinner } from 'react-bootstrap';
import './styles.scss';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

function isTarefaStatus(status: any): status is TarefaStatus {
  return ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].includes(
    status
  );
}

// Helper function to calculate working days between two dates
const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let workingDays = 0;
  let currentDate = new Date(startDate);

  // Set both dates to midnight to ensure we're only comparing dates, not times
  currentDate.setHours(0, 0, 0, 0);
  const endDateMidnight = new Date(endDate);
  endDateMidnight.setHours(0, 0, 0, 0);

  // Count working days
  while (currentDate <= endDateMidnight) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      // 0 is Sunday, 6 is Saturday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumnsAndTarefas = async () => {
      setIsLoading(true);
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

            // Calculate working days if prazoEstimado and prazoReal exist
            let workingDays: number | undefined = undefined;
            if (tarefaWithUsers.workingDays !== undefined) {
              // Use existing workingDays if available
              workingDays = tarefaWithUsers.workingDays;
            } else if (
              tarefaWithUsers.prazoEstimado &&
              tarefaWithUsers.prazoReal &&
              !isNaN(new Date(tarefaWithUsers.prazoEstimado).getTime()) &&
              !isNaN(new Date(tarefaWithUsers.prazoReal).getTime())
            ) {
              // Calculate workingDays if not available
              const startDate = new Date(tarefaWithUsers.prazoEstimado);
              const endDate = new Date(tarefaWithUsers.prazoReal);
              workingDays = calculateWorkingDays(startDate, endDate);
            }

            const kanbanTarefa: KanbanTarefa = {
              ...tarefaWithUsers,
              column: tarefaWithUsers.status as TarefaStatus,
              projeto: { id: projeto.id, designacao: projeto.designacao },
              uniqueId: `${tarefa.id}-${Date.now()}`,
              workingDays: workingDays,
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
        setError(null);
      } catch (error) {
        console.error('Error fetching columns and tarefas:', error);
        setError('Erro ao carregar dados do quadro Kanban');
      } finally {
        setIsLoading(false);
      }
    };

    fetchColumnsAndTarefas();
  }, [projeto]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId as TarefaStatus];
    const destColumn = columns[destination.droppableId as TarefaStatus];

    // Remove from source column
    const [removed] = sourceColumn.splice(source.index, 1);

    // Add to destination column
    destColumn.splice(destination.index, 0, {
      ...removed,
      status: destination.droppableId as TarefaStatus,
    });

    // Update state
    const newColumns = {
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    };

    setColumns(newColumns);

    // Update in backend
    try {
      await updateTarefaStatus(
        removed.id,
        destination.droppableId as TarefaStatus
      );
    } catch (error) {
      console.error('Failed to update tarefa status:', error);
      // Revert changes on error
      setColumns(columns);
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '300px' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-board-container">
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
