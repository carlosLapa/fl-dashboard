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
  getTarefasSorted,
  calculateWorkingDays,
  getTarefasFiltered,
} from 'services/tarefaService';
import { useNotification } from '../../hooks/useNotification';
import { Button, Spinner } from 'react-bootstrap';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const { sendNotification } = useNotification();

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterField, setDateFilterField] = useState('prazoEstimado');
  const [isFiltered, setIsFiltered] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

  // Working days tracking
  const [workingDaysMap, setWorkingDaysMap] = useState<Record<number, number>>(
    {}
  );

  // Enhanced filtering states - MODIFIED
  const [descricaoFilter, setDescricaoFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projetoFilter, setProjetoFilter] = useState(''); // This will store the PROJECT NAME
  const [projetoFilterId, setProjetoFilterId] = useState(''); // NEW: This will store the PROJECT ID
  const [isAdvancedFiltered, setIsAdvancedFiltered] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Optimize the handleWorkingDaysCalculated callback
  const handleWorkingDaysCalculated = useCallback(
    (tarefaId: number, workingDays: number) => {
      setWorkingDaysMap((prev) => {
        if (prev[tarefaId] === workingDays) {
          return prev;
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

  // MODIFIED: Updated to use both projetoFilter and projetoFilterId
  const fetchAdvancedFilteredTarefas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filterParams = {
        page,
        size: pageSize,
        sort: sortField,
        direction: sortDirection,
        descricao: descricaoFilter || undefined,
        status: statusFilter || undefined,
        projeto: projetoFilterId || projetoFilter || undefined, // Use ID first, then name
        dateField: startDate || endDate ? dateFilterField : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      console.log(
        'fetchAdvancedFilteredTarefas - Filter params:',
        filterParams
      );

      const response = await getTarefasFiltered(filterParams);
      console.log('fetchAdvancedFilteredTarefas - API response:', response);

      if (response && response.content) {
        setTarefas(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Erro ao filtrar tarefas:', error);
      setError('Erro ao filtrar tarefas');
      toast.error('Erro ao filtrar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  // Effect for normal fetching
  useEffect(() => {
    if (!isFiltered && !isAdvancedFiltered) {
      fetchTarefas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    sortField,
    sortDirection,
    isFiltered,
    isAdvancedFiltered,
  ]);

  // Effect for date filtering
  useEffect(() => {
    if (isFiltered && !isAdvancedFiltered) {
      fetchFilteredTarefas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    isFiltered,
    isAdvancedFiltered,
    startDate,
    endDate,
    dateFilterField,
    sortField,
    sortDirection,
  ]);

  // MODIFIED: Updated dependency array to include projetoFilterId
  useEffect(() => {
    if (isAdvancedFiltered) {
      fetchAdvancedFilteredTarefas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    isAdvancedFiltered,
    descricaoFilter,
    statusFilter,
    projetoFilter,
    projetoFilterId, // Added this
    startDate,
    endDate,
    dateFilterField,
    sortField,
    sortDirection,
  ]);

  // Update the working days effect to prevent infinite loops
  useEffect(() => {
    if (Object.keys(workingDaysMap).length > 0) {
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

      if (needsUpdate) {
        setTarefas(updatedTarefas);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingDaysMap]);

  useEffect(() => {
    console.log('Filter states changed:', {
      descricaoFilter,
      statusFilter,
      projetoFilter,
      projetoFilterId,
      isAdvancedFiltered,
      isFiltered,
    });
  }, [
    descricaoFilter,
    statusFilter,
    projetoFilter,
    projetoFilterId,
    isAdvancedFiltered,
    isFiltered,
  ]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
    setPage(0);

    if (isFiltered || isAdvancedFiltered) {
      setIsFiltered(false);
      setIsAdvancedFiltered(false);
      setStartDate('');
      setEndDate('');
      setDescricaoFilter('');
      setStatusFilter('');
      setProjetoFilter('');
      setProjetoFilterId(''); // Clear the ID too
    }
  };

  // Handler functions for enhanced filters
  const handleDescricaoFilterChange = (value: string) => {
    setDescricaoFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // MODIFIED: Updated to handle both name and ID
  const handleProjetoFilterChange = (value: string, isId: boolean = false) => {
    console.log(
      'handleProjetoFilterChange called with value:',
      value,
      'isId:',
      isId
    );

    if (isId) {
      // This is an ID from project selection
      setProjetoFilterId(value);
      // Don't update projetoFilter here - let the child component handle the name
    } else {
      // This is a name from manual typing
      setProjetoFilter(value);
      setProjetoFilterId(''); // Clear ID when manually typing
    }
  };

  const handleApplyFilters = () => {
    console.log('handleApplyFilters called with filters:', {
      descricao: descricaoFilter,
      status: statusFilter,
      projeto: projetoFilter,
      projetoId: projetoFilterId,
      startDate,
      endDate,
      dateFilterField,
    });
    setPage(0);
    setIsAdvancedFiltered(true);
    setIsFiltered(false);
  };

  // MODIFIED: Updated to clear both projeto states
  const handleClearFilters = () => {
    console.log('handleClearFilters called');
    setDescricaoFilter('');
    setStatusFilter('');
    setProjetoFilter('');
    setProjetoFilterId(''); // Clear the ID too
    setStartDate('');
    setEndDate('');
    setPage(0);
    setIsAdvancedFiltered(false);
    setIsFiltered(false);
  };

  const handleApplyDateFilter = () => {
    if (!startDate && !endDate) {
      toast.warning('Por favor, selecione pelo menos uma data para filtrar');
      return;
    }
    setPage(0);
    setIsFiltered(true);
    setIsAdvancedFiltered(false);
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsFiltered(false);
  };

  // Rest of the handler functions remain the same...
  const handleAddTarefa = async (formData: TarefaInsertFormData) => {
    try {
      if (formData.prazoEstimado && formData.prazoReal) {
        const workingDays = calculateWorkingDays(
          formData.prazoEstimado,
          formData.prazoReal
        );
        formData = { ...formData, workingDays };
      }

      await addTarefa(formData, sendNotification);
      if (isAdvancedFiltered) {
        await fetchAdvancedFilteredTarefas();
      } else if (isFiltered) {
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
      if (formData.prazoEstimado && formData.prazoReal) {
        const workingDays = calculateWorkingDays(
          formData.prazoEstimado,
          formData.prazoReal
        );
        formData = { ...formData, workingDays };
      }

      await updateTarefa(formData.id, formData, sendNotification);
      if (isAdvancedFiltered) {
        await fetchAdvancedFilteredTarefas();
      } else if (isFiltered) {
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
      if (isAdvancedFiltered) {
        await fetchAdvancedFilteredTarefas();
      } else if (isFiltered) {
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
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      await updateTarefaStatus(tarefaId, newStatus, sendNotification, tarefa);
      if (isAdvancedFiltered) {
        await fetchAdvancedFilteredTarefas();
      } else if (isFiltered) {
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
    <div className="page-container" style={{ marginTop: '2rem' }}>
      {/* Wrap the title container and content in a div with consistent width and margins */}
      <div
        style={{
          width: '98%',
          marginLeft: '2%',
          marginRight: '2%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <h2 className="page-title">Tarefas</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={() => {
                setTarefaToEdit(null);
                setShowModal(true);
              }}
              className="create-button me-3"
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Adicionar Tarefa
            </Button>
            <Button variant="secondary" onClick={toggleViewMode}>
              {viewMode === 'table' ? 'Ver Calendário' : 'Ver Tabela'}
            </Button>
          </div>
        </div>
        {/* Content wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
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
                // Enhanced filter props
                descricaoFilter={descricaoFilter}
                statusFilter={statusFilter}
                projetoFilter={projetoFilter}
                onDescricaoFilterChange={handleDescricaoFilterChange}
                onStatusFilterChange={handleStatusFilterChange}
                onProjetoFilterChange={handleProjetoFilterChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                showFilters={showFilters}
                onToggleFilters={setShowFilters}
              />
            </div>
          ) : (
            <TarefasCalendar
              tarefas={tarefas}
              onWorkingDaysCalculated={handleWorkingDaysCalculated}
            />
          )}
        </div>
      </div>

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
