import React, { useState, useEffect } from 'react';
import TarefaTable from 'components/Tarefa/TarefaTable';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaInsertFormData,
  TarefaUpdateFormData,
  TarefaStatus,
} from 'types/tarefa';
import {
  getAllTarefasWithUsersAndProjeto,
  addTarefa,
  updateTarefa,
  deleteTarefa,
  updateTarefaStatus,
  getTarefasByDateRange,
  getTarefasSorted, // Import the new sorting function
} from 'services/tarefaService';
import Button from 'react-bootstrap/Button';
import TarefaModal from 'components/Tarefa/TarefaModal';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';
import TarefaDetailsCard from 'components/Tarefa/TarefaDetailsCard';
import { toast } from 'react-toastify';
import './styles.css';

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

  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterField, setDateFilterField] = useState('prazoEstimado');
  const [isFiltered, setIsFiltered] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');

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
      await addTarefa(formData);
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
      await updateTarefa(formData.id, formData);
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
      await updateTarefaStatus(tarefaId, newStatus);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Tarefas</h2>
      <div
        className="d-flex align-items-center gap-2 mb-4"
        style={{ marginLeft: '5%' }}
      >
        <Button
          variant="primary"
          onClick={() => {
            setTarefaToEdit(null);
            setShowModal(true);
          }}
          className="add-tarefa-btn"
          style={{ whiteSpace: 'nowrap' }}
        >
          Adicionar Tarefa
        </Button>
        <Button
          variant="secondary"
          onClick={toggleViewMode}
          style={{ whiteSpace: 'nowrap' }}
        >
          {viewMode === 'table' ? 'Ver Calendário' : 'Ver Tabela'}
        </Button>
      </div>
      {viewMode === 'table' ? (
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
      ) : (
        <TarefasCalendar tarefas={tarefas} />
      )}
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
