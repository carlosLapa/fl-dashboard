import React, { useState, useEffect, useMemo } from 'react';
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
import { Spinner, Alert } from 'react-bootstrap';
import './styles.scss';
// Import permission related modules
import { Permission } from '../../permissions/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';

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
  // Get the permissions hook for checking user permissions
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  // Direct admin check that doesn't rely on the permission system
  const isAdmin = useMemo(() => {
    if (user?.roles) {
      return user.roles.some(
        (role) => role.authority === 'ROLE_ADMIN' || role.role_type === 'ADMIN'
      );
    }
    return false;
  }, [user]);

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
  const [projectDeleted, setProjectDeleted] = useState(false);

  useEffect(() => {
    const fetchColumnsAndTarefas = async () => {
      setIsLoading(true);

      // Check if projeto exists and has necessary properties
      if (!projeto || !projeto.id) {
        setError('Projeto não encontrado ou informações incompletas.');
        setIsLoading(false);
        return;
      }

      try {
        // Attempt to fetch columns for the project
        let fetchedColumns;
        try {
          fetchedColumns = await getColumnsForProject(projeto.id);
          if (!fetchedColumns || fetchedColumns.length === 0) {
            console.warn(`No columns found for project ID: ${projeto.id}`);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (
              error.response?.status === 400 ||
              error.response?.status === 404 ||
              error.response?.status === 403
            ) {
              setProjectDeleted(true);
              setError(
                'Este projeto foi excluído ou não está mais disponível.'
              );
              setIsLoading(false);
              return;
            }
          }
          throw error;
        }

        const updatedColumns: { [key in TarefaStatus]: KanbanTarefa[] } = {
          BACKLOG: [],
          TODO: [],
          IN_PROGRESS: [],
          IN_REVIEW: [],
          DONE: [],
        };

        if (fetchedColumns) {
          fetchedColumns.forEach((column: ColunaWithProjetoDTO) => {
            if (column.status in updatedColumns) {
              updatedColumns[column.status as TarefaStatus] = [];
            }
          });
        }

        // Ensure projeto.tarefas exists before trying to iterate
        if (!projeto.tarefas || !Array.isArray(projeto.tarefas)) {
          console.warn(
            `Project ${projeto.id} has no tasks or tarefas is not an array`
          );
          setColumns(updatedColumns);
          setError(null);
          setIsLoading(false);
          return;
        }

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
            if (axios.isAxiosError(error)) {
              if (error.response?.status === 404) {
                console.warn(
                  `Task ${tarefa.id} not found, may have been deleted`
                );
                continue;
              } else if (error.response?.status === 403) {
                console.warn(`Permission denied for task ${tarefa.id}`);
                continue;
              } else if (error.response?.status === 400) {
                console.warn(`Bad request for task ${tarefa.id}`);
                continue;
              }
            }
            console.error(`Error fetching task ${tarefa.id}:`, error);
            continue;
          }
        }

        setColumns(updatedColumns);
        setError(null);
      } catch (error) {
        console.error('Error fetching columns and tarefas:', error);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError('Você não tem permissão para acessar este projeto.');
          } else if (
            error.response?.status === 404 ||
            error.response?.status === 400
          ) {
            setProjectDeleted(true);
            setError('Este projeto foi excluído ou não está mais disponível.');
          } else {
            setError(
              'Erro ao carregar dados do quadro Kanban. Por favor, tente novamente.'
            );
          }
        } else {
          setError(
            'Erro ao carregar dados do quadro Kanban. Por favor, tente novamente.'
          );
        }
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

    // Admin override - skip permission checks for admins
    if (!isAdmin) {
      // Check permissions for specific column movements
      if (
        destination.droppableId === 'IN_REVIEW' &&
        !hasPermission(Permission.MOVE_CARD_TO_REVIEW)
      ) {
        toast.error(
          'Você não tem permissão para mover tarefas para Em Revisão'
        );
        return; // Block the movement
      }

      if (
        destination.droppableId === 'DONE' &&
        !hasPermission(Permission.MOVE_CARD_TO_DONE)
      ) {
        toast.error('Você não tem permissão para mover tarefas para Concluído');
        return; // Block the movement
      }
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
      toast.error('Falha ao atualizar o status da tarefa');
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

  if (projectDeleted) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>Projeto não disponível</Alert.Heading>
        <p>Este projeto foi excluído ou não está mais disponível no sistema.</p>
        <p>
          Se você acredita que isto é um erro, entre em contato com um
          administrador.
        </p>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        <Alert.Heading>Erro</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <div className="kanban-board-wrapper">
      {/* Show different alerts based on user role */}
      {!isAdmin && !hasPermission(Permission.MOVE_CARD_TO_REVIEW) && (
        <Alert variant="info" className="mb-3">
          Nota: Você pode mover tarefas apenas entre as colunas "Backlog", "A
          Fazer" e "Em Progresso". Para mover para "Em Revisão" ou "Concluído",
          entre em contato com um gerente ou administrador.
        </Alert>
      )}

      {isAdmin && (
        <Alert variant="success" className="mb-3">
          <strong>Modo Administrador:</strong> Você tem acesso completo ao
          quadro Kanban.
        </Alert>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board-container">
          {columnsOrder.map((columnId) => {
            // Define which columns are freely accessible to employees
            const isUnrestrictedColumn = [
              'BACKLOG',
              'TODO',
              'IN_PROGRESS',
            ].includes(columnId);

            return (
              <TarefaColumn
                key={columnId}
                columnId={columnId}
                tarefas={columns[columnId]}
                columnTitle={statusTranslations[columnId]}
                canDrop={
                  isAdmin || // Admin can drop anywhere
                  isUnrestrictedColumn || // Employees can drop in unrestricted columns
                  (columnId === 'IN_REVIEW' &&
                    hasPermission(Permission.MOVE_CARD_TO_REVIEW)) ||
                  (columnId === 'DONE' &&
                    hasPermission(Permission.MOVE_CARD_TO_DONE))
                }
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjetoKanbanBoard;
