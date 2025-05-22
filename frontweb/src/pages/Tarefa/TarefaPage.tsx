import React, { useState, useEffect, useCallback } from 'react';
import TarefaTable from 'components/Tarefa/TarefaTable';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from 'types/tarefa';
import {
  addTarefa,
  updateTarefa,
  deleteTarefa,
  updateTarefaStatus,
  getTarefasByDateRange,
  getTarefasSorted, // Import the new sorting function
  calculateWorkingDays, // Import the working days calculation function
} from 'services/tarefaService';
import { useNotification } from '../../hooks/useNotification';
import { Button, Row, Col, Spinner } from 'react-bootstrap';
import TarefaModal from 'components/Tarefa/TarefaModal';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';
import TarefaDetailsCard from 'components/Tarefa/TarefaDetailsCard';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './tarefaStyles.scss';

const TarefaPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);
  const [tarefas, setTarefas] = useState<TarefaWithUserAndProjetoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tarefaToEdit, setTarefaToEdit] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { sendNotification } = useNotification();

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // 'prazoEstimado' for Início, 'prazoReal' for Prazo
  const [dateFilterField, setDateFilterField] = useState('prazoEstimado');
  const [isFiltered, setIsFiltered] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Working days tracking
  const [workingDaysMap, setWorkingDaysMap] = useState<Record<number, number>>(
    {}
  );

  // Optimize the handleWorkingDaysCalculated callback
  const handleWorkingDaysCalculated = useCallback(
    (tarefaId: number, workingDays: number) => {
      setWorkingDaysMap((prev) => {
        // Only update if the value is different
        if (prev[tarefaId] === workingDays) {
          return prev; // Return the same object to avoid a re-render
        }
        return {
          ...prev,
          [tarefaId]: workingDays,
        };
      });
    },
    []
  );

  const fetchTarefas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the sorted API if not filtered
      const response = await getTarefasSorted(
        sortField,
        sortDirection,
        page,
        pageSize
      );
      if (response && response.content) {
        setTarefas(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setError('Erro ao carregar tarefas');
      toast.error('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredTarefas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getTarefasByDateRange(
        dateFilterField,
        startDate,
        endDate,
        page,
        pageSize
      );
      if (response && response.content) {
        setTarefas(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Erro ao filtrar tarefas por data:', error);
      setError('Erro ao filtrar tarefas por data');
      toast.error('Erro ao filtrar tarefas por data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFiltered) {
      fetchFilteredTarefas();
    } else {
      fetchTarefas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, isFiltered, sortField, sortDirection]);

  // Update the working days effect to prevent infinite loops
  useEffect(() => {
    if (Object.keys(workingDaysMap).length > 0) {
      // Check if we actually need to update any tasks
      let needsUpdate = false;
      const updatedTarefas = tarefas.map((tarefa) => {
        if (
          workingDaysMap[tarefa.id] !== undefined &&
          tarefa.workingDays !== workingDaysMap[tarefa.id]
        ) {
          needsUpdate = true;
          return {
            ...tarefa,
            workingDays: workingDaysMap[tarefa.id],
          };
        }
        return tarefa;
      });

      // Only update state if there are actual changes
      if (needsUpdate) {
        setTarefas(updatedTarefas);
      }
    }
  }, [workingDaysMap]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      // Default to ASC for a new field
      setSortField(field);
      setSortDirection('ASC');
    }
    setPage(0); // Reset to first page when sorting changes
    // Clear filters when sorting
    if (isFiltered) {
      setIsFiltered(false);
      setStartDate('');
      setEndDate('');
    }
  };

  const handleApplyDateFilter = () => {
    if (!startDate && !endDate) {
      toast.warning('Por favor, selecione pelo menos uma data para filtrar');
      return;
    }
    setPage(0); // Reset to first page when applying filter
    setIsFiltered(true);
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsFiltered(false);
  };

  const handleAddTarefa = async (formData: TarefaInsertFormData) => {
    try {
      // Calculate working days if both dates are provided
      if (formData.prazoEstimado && formData.prazoReal) {
        const workingDays = calculateWorkingDays(
          formData.prazoEstimado,
          formData.prazoReal
        );
        formData = { ...formData, workingDays };
      }

      // Pass the sendNotification function to the service
      await addTarefa(formData, sendNotification);
      if (isFiltered) {
        await fetchFilteredTarefas();
      } else {
        await fetchTarefas();
      }
      setShowModal(false);
      toast.success('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error('Error ao adicionar tarefa:', error);
      toast.error('Erro ao adicionar tarefa');
    }
  };

  const handleUpdateTarefa = async (formData: TarefaUpdateFormData) => {
    try {
      // Calculate working days if both dates are provided
      if (formData.prazoEstimado && formData.prazoReal) {
        const workingDays = calculateWorkingDays(
          formData.prazoEstimado,
          formData.prazoReal
        );
        formData = { ...formData, workingDays };
      }

      // Pass the sendNotification function to the service
      await updateTarefa(formData.id, formData, sendNotification);
      if (isFiltered) {
        await fetchFilteredTarefas();
      } else {
        await fetchTarefas();
      }
      setShowModal(false);
      setTarefaToEdit(null);
      toast.success('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleAddOrUpdateTarefa = async (
    formData: TarefaInsertFormData | TarefaUpdateFormData
  ) => {
    if ('id' in formData) {
      await handleUpdateTarefa(formData as TarefaUpdateFormData);
    } else {
      await handleAddTarefa(formData as TarefaInsertFormData);
    }
  };

  const handleEditTarefa = (tarefaId: number) => {
    const tarefaToEdit = tarefas.find((tarefa) => tarefa.id === tarefaId);
    if (tarefaToEdit) {
      setTarefaToEdit(tarefaToEdit);
      setShowModal(true);
    }
  };

  const handleDeleteTarefa = async (tarefaId: number) => {
    try {
      await deleteTarefa(tarefaId);
      if (isFiltered) {
        await fetchFilteredTarefas();
      } else {
        await fetchTarefas();
      }
      toast.success('Tarefa apagada com sucesso!');
    } catch (error) {
      console.error('Erro ao apagar tarefa:', error);
      toast.error('Erro ao apagar tarefa');
    }
  };

  const handleViewDetails = (tarefaId: number) => {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (tarefa) {
      setSelectedTarefa(tarefa);
      setShowDetailsCard(true);
    }
  };

  const handleStatusUpdate = async (
    tarefaId: number,
    newStatus: TarefaStatus
  ) => {
    try {
      // Find the tarefa for notification details
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      await updateTarefaStatus(tarefaId, newStatus, sendNotification, tarefa);
      if (isFiltered) {
        await fetchFilteredTarefas();
      } else {
        await fetchTarefas();
      }
      toast.success('Status da tarefa atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
      toast.error('Erro ao atualizar status da tarefa');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'table' ? 'calendar' : 'table');
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-title-container">
        <h2 className="page-title">Tarefas</h2>
        <div className="page-actions">
          <Button
            variant="primary"
            onClick={() => {
              setTarefaToEdit(null);
              setShowModal(true);
            }}
            className="create-button me-3" // Added Bootstrap's me-3 class for margin-right
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Adicionar Tarefa
          </Button>
          <Button variant="secondary" onClick={toggleViewMode}>
            {viewMode === 'table' ? 'Ver Calendário' : 'Ver Tabela'}
          </Button>
        </div>
      </div>
      <Row className="mt-4">
        <Col xs={12}>
          {viewMode === 'table' ? (
            <div className="table-responsive">
              <TarefaTable
                tarefas={tarefas}
                onEditTarefa={handleEditTarefa}
                onDeleteTarefa={handleDeleteTarefa}
                onViewDetails={handleViewDetails}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApplyDateFilter={handleApplyDateFilter}
                onClearDateFilter={handleClearDateFilter}
                dateFilterField={dateFilterField}
                onDateFilterFieldChange={setDateFilterField}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </div>
          ) : (
            <TarefasCalendar
              tarefas={tarefas}
              onWorkingDaysCalculated={handleWorkingDaysCalculated}
            />
          )}
        </Col>
      </Row>
      <TarefaModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setTarefaToEdit(null);
        }}
        onSave={handleAddOrUpdateTarefa}
        onStatusChange={handleStatusUpdate}
        isEditing={!!tarefaToEdit}
        tarefa={tarefaToEdit}
      />
      {showDetailsCard && selectedTarefa && (
        <TarefaDetailsCard
          tarefa={selectedTarefa}
          onClose={() => setShowDetailsCard(false)}
        />
      )}
    </div>
  );
};

export default TarefaPage;
