import React, { useCallback, useMemo, useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import TarefaColumn from './TarefaColumn';
import TarefaModal from './TarefaModal';
import {
  KanbanTarefa,
  TarefaStatus,
  TarefaUpdateFormData,
  TarefaWithUserAndProjetoDTO,
} from '../../types/tarefa';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import axios from 'axios';
import {
  getTarefaWithUsersAndProjeto,
  calculateWorkingDays as calculateWorkingDaysStr,
} from 'services/tarefaService';
import { Spinner, Alert } from 'react-bootstrap';
import './styles.scss';
// Import permission related modules
import { Permission } from '../../permissions/rolePermissions';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import {
  KanbanColumns,
  useProjetoKanban,
} from '../../hooks/useProjetoKanban';
import { TAREFA_STATUS_LABELS } from '../../constants/tarefaStatus';

interface ProjetoKanbanBoardProps {
  projeto: ProjetoWithUsersAndTarefasDTO;
}

const ProjetoKanbanBoard: React.FC<ProjetoKanbanBoardProps> = ({ projeto }) => {
  // Get the permissions hook for checking user permissions
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  const {
    columns,
    isLoading,
    error,
    isProjetoIndisponivel,
    moveTarefa,
    changeTarefaStatus,
    saveTarefaEdit,
    archiveTarefa,
  } = useProjetoKanban(projeto);

  // Direct admin check that doesn't rely on the permission system
  const isAdmin = useMemo(() => {
    if (user?.roles) {
      return user.roles.some(
        (role) => role.authority === 'ROLE_ADMIN' || role.role_type === 'ADMIN'
      );
    }
    return false;
  }, [user]);

  const statusTranslations = TAREFA_STATUS_LABELS;

  const [columnsOrder] = useState<TarefaStatus[]>([
    'BACKLOG',
    'TODO',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [tarefaToEdit, setTarefaToEdit] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);

  // useCallback: mantém uma referência estável entre renders, para que o
  // React.memo em TarefaColumn/TarefaCard não seja invalidado só por causa
  // deste handler ser recriado a cada render do board.
  const handleCardClick = useCallback(async (tarefa: KanbanTarefa) => {
    try {
      const fullTarefa = await getTarefaWithUsersAndProjeto(tarefa.id);
      setTarefaToEdit(fullTarefa);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erro ao carregar dados da tarefa:', error);
      toast.error('Erro ao carregar dados da tarefa');
    }
  }, []);

  const handleTarefaModalStatusChange = (
    tarefaId: number,
    newStatus: TarefaStatus
  ) => {
    changeTarefaStatus({ tarefaId, newStatus });
  };

  const handleArchiveTarefa = (tarefaId: number) => {
    archiveTarefa(tarefaId, {
      onSuccess: () => {
        setShowEditModal(false);
        setTarefaToEdit(null);
      },
    });
  };

  const handleSaveTarefaEdit = (formData: TarefaUpdateFormData) => {
    if (formData.prazoEstimado && formData.prazoReal) {
      formData = {
        ...formData,
        workingDays: calculateWorkingDaysStr(
          formData.prazoEstimado,
          formData.prazoReal
        ),
      };
    }
    saveTarefaEdit(formData, {
      onSuccess: () => {
        setShowEditModal(false);
        setTarefaToEdit(null);
      },
      onError: (error) => {
        if (error instanceof Error && error.message.includes('prazo')) {
          // Keep the modal open so the user can fix the invalid date.
          return;
        }
        setShowEditModal(false);
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setTarefaToEdit(null);
        }
      },
    });
  };

  const onDragEnd = (result: DropResult) => {
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
      if (
        destination.droppableId === 'DONE' &&
        !hasPermission(Permission.MOVE_CARD_TO_DONE)
      ) {
        toast.error('Não tem permissão para mover tarefas para Concluído');
        return; // Block the movement
      }
    }

    // Copy the affected arrays so mutating them doesn't also mutate the
    // cached `columns` still referenced elsewhere (e.g. React Query's own
    // snapshot for the optimistic-update rollback).
    const sourceColumn = [...columns[source.droppableId as TarefaStatus]];
    const destColumn =
      destination.droppableId === source.droppableId
        ? sourceColumn
        : [...columns[destination.droppableId as TarefaStatus]];

    // Remove from source column
    const [removed] = sourceColumn.splice(source.index, 1);

    // Add to destination column
    destColumn.splice(destination.index, 0, {
      ...removed,
      status: destination.droppableId as TarefaStatus,
    });

    const newColumns: KanbanColumns = {
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    };

    // moveTarefa applies the optimistic update, calls the backend, sends
    // notifications, and rolls back on error — all inside useProjetoKanban.
    moveTarefa({
      tarefa: removed,
      newStatus: destination.droppableId as TarefaStatus,
      statusLabel: statusTranslations[destination.droppableId as TarefaStatus],
      newColumns,
    });
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

  if (isProjetoIndisponivel) {
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
        <p>Erro ao carregar dados do quadro Kanban. Por favor, tente novamente.</p>
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
                onCardClick={handleCardClick}
              />
            );
          })}
        </div>
      </DragDropContext>

      <TarefaModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setTarefaToEdit(null);
        }}
        onSave={(formData) =>
          handleSaveTarefaEdit(formData as TarefaUpdateFormData)
        }
        onStatusChange={handleTarefaModalStatusChange}
        onArchive={handleArchiveTarefa}
        isEditing={true}
        tarefa={tarefaToEdit}
      />
    </div>
  );
};

export default ProjetoKanbanBoard;
