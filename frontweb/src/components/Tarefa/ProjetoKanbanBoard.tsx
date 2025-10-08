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
  getTarefaWithUsersAndProjeto,
} from 'services/tarefaService';
import { ColunaWithProjetoDTO } from '../../types/coluna';
import { Spinner, Alert } from 'react-bootstrap';
import './styles.scss';
// Import permission related modules
import { Permission } from '../../permissions/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import { useNotification } from '../../NotificationContext'; // Adjust path if needed
import { NotificationType } from 'types/notification';

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
  const { sendNotification } = useNotification();

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

      // Diagnóstico: Verificar como o objeto projeto está chegando
      console.log(
        'Projeto recebido no componente Kanban:',
        JSON.stringify(projeto, null, 2)
      );

      // Verificação mais resiliente
      if (!projeto) {
        setError('Projeto não encontrado.');
        setIsLoading(false);
        return;
      }

      // Verificar se tem ID mesmo se o objeto existe
      if (!projeto.id) {
        setError('Projeto sem identificador válido.');
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
              console.error(
                `Erro ao buscar colunas do projeto ${projeto.id}:`,
                error
              );
              setProjectDeleted(true);
              setError(
                'Este projeto foi excluído ou não está mais disponível.'
              );
              setIsLoading(false);
              return;
            }
          }
          console.error(`Erro não tratado ao buscar colunas:`, error);
          throw error;
        }

        // Sempre inicializar com todas as colunas vazias
        const updatedColumns: { [key in TarefaStatus]: KanbanTarefa[] } = {
          BACKLOG: [],
          TODO: [],
          IN_PROGRESS: [],
          IN_REVIEW: [],
          DONE: [],
        };

        // Se há colunas definidas no backend, use-as
        if (fetchedColumns && fetchedColumns.length > 0) {
          console.log(
            `Usando ${fetchedColumns.length} colunas do backend para projeto ${projeto.id}`
          );
          fetchedColumns.forEach((column: ColunaWithProjetoDTO) => {
            if (column.status in updatedColumns) {
              updatedColumns[column.status as TarefaStatus] = [];
            }
          });
        } else {
          console.log(
            `Usando colunas padrão para projeto ${projeto.id} (nenhuma encontrada no backend)`
          );
        }

        // Verificar explicitamente se tarefas é um array válido
        const hasValidTarefas =
          projeto.tarefas &&
          Array.isArray(projeto.tarefas) &&
          projeto.tarefas.length > 0;

        // Se não tiver tarefas, apenas inicialize o quadro vazio
        if (!hasValidTarefas) {
          console.log(
            `Projeto ${projeto.id} sem tarefas, inicializando quadro Kanban vazio`
          );
          setColumns(updatedColumns);
          setError(null);
          setIsLoading(false);
          return;
        }

        console.log(
          `Processando ${projeto.tarefas.length} tarefas para o projeto ${projeto.id}`
        );

        // O restante do código permanece igual...
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
        console.error(
          `Erro geral ao processar o quadro Kanban para o projeto ${projeto?.id}:`,
          error
        );

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setError('Não tem permissão para aceder a este projeto.');
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
      // Remoção da verificação para IN_REVIEW para permitir que Colaboradores possam mover
      // if (
      //   destination.droppableId === 'IN_REVIEW' &&
      //   !hasPermission(Permission.MOVE_CARD_TO_REVIEW)
      // ) {
      //   toast.error('Não tem permissão para mover tarefas para Em Revisão');
      //   return; // Block the movement
      // }

      // Manter apenas a verificação para DONE
      if (
        destination.droppableId === 'DONE' &&
        !hasPermission(Permission.MOVE_CARD_TO_DONE)
      ) {
        toast.error('Não tem permissão para mover tarefas para Concluído');
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
      console.log(
        `Movendo tarefa ${removed.id} de ${source.droppableId} para ${destination.droppableId}`
      );

      // Obter a tarefa completa com usuários e projeto
      const tarefaCompleta = await getTarefaWithUsersAndProjeto(removed.id);
      console.log(
        `Tarefa completa obtida: ID=${removed.id}, usuários=${tarefaCompleta.users.length}`
      );

      await updateTarefaStatus(
        removed.id,
        destination.droppableId as TarefaStatus,
        async (notification) => {
          try {
            console.log(
              `[Kanban] Enviando notificação para usuário ${notification.userId}`
            );
            sendNotification(notification);
            return Promise.resolve();
          } catch (error) {
            console.error(`[Kanban] Erro ao enviar notificação:`, error);
            return Promise.resolve(); // Ainda retornamos uma promise resolvida para não interromper o fluxo
          }
        },
        tarefaCompleta
      );

      // Notify Coordenador if not the user moving the card
      const coordenador = projeto.coordenador;
      if (
        coordenador &&
        user &&
        coordenador.id !== user.id // Only notify if mover is not the coordenador
      ) {
        sendNotification({
          type: NotificationType.TAREFA_STATUS_ALTERADO, // Use the enum value, not a string
          content: `A tarefa "${removed.descricao}" foi movida para "${destination.droppableId}" por ${user.name}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: removed.id,
          userId: coordenador.id,
          tarefaId: removed.id,
          projetoId: projeto.id,
        });
      }

      toast.success(
        `Tarefa "${removed.descricao}" movida para "${
          statusTranslations[destination.droppableId as TarefaStatus]
        }"`
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
          <span className="visually-hidden">A Carregar...</span>
        </Spinner>
      </div>
    );
  }

  if (projectDeleted) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>Projeto não disponível</Alert.Heading>
        <p>Este projeto foi excluído ou não está mais disponível no sistema.</p>
        <p>Se crê ser um erro, entre em contato com um administrador.</p>
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
      {/* Atualizar texto da mensagem informativa */}
      {!isAdmin && !hasPermission(Permission.MOVE_CARD_TO_DONE) && (
        <Alert variant="info" className="mb-3">
          Nota: Pode mover tarefas entre as colunas "Backlog", "A Fazer", "Em
          Progresso" e "Em Revisão". Só um gestor ou admin pode mover tarefas
          para "Concluído".
        </Alert>
      )}

      {isAdmin && (
        <Alert variant="success" className="mb-3">
          <strong>Modo Administrador:</strong> Tem acesso completo ao quadro
          Kanban.
        </Alert>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board-container">
          {columnsOrder.map((columnId) => {
            // Atualizar as colunas sem restrição para incluir IN_REVIEW
            const isUnrestrictedColumn = [
              'BACKLOG',
              'TODO',
              'IN_PROGRESS',
              'IN_REVIEW', // IN_REVIEW adicionada como coluna sem restrição
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
