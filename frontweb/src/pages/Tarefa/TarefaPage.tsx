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
} from 'services/tarefaService';
import Button from 'react-bootstrap/Button';
import TarefaModal from 'components/Tarefa/TarefaModal';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';
//import BackButton from 'components/Shared/BackButton';
import TarefaDetailsCard from 'components/Tarefa/TarefaDetailsCard';
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

  const fetchTarefas = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllTarefasWithUsersAndProjeto(page, pageSize);
      if (response && response.content) {
        setTarefas(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      setError('Erro ao carregar tarefas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddTarefa = async (formData: TarefaInsertFormData) => {
    try {
      await addTarefa(formData);
      await fetchTarefas();
      setShowModal(false);
    } catch (error) {
      console.error('Error ao adicionar tarefa:', error);
    }
  };

  const handleUpdateTarefa = async (formData: TarefaUpdateFormData) => {
    try {
      await updateTarefa(formData.id, formData);
      await fetchTarefas();
      setShowModal(false);
      setTarefaToEdit(null);
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
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
      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao apagar tarefa:', error);
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
      await fetchTarefas();
    } catch (error) {
      console.error('Erro ao atualizar status da tarefa:', error);
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
          style={{ whiteSpace: 'nowrap'}}
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
