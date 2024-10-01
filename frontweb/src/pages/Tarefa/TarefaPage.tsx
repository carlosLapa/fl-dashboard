import React, { useState, useEffect } from 'react';
import TarefaTable from 'components/Tarefa/TarefaTable';
import {
  TarefaWithUsersAndProjetoDTO,
  TarefaInsertFormData,
  TarefaUpdateFormData,
} from 'types/tarefa';
import {
  getAllTarefasWithUsersAndProjeto,
  addTarefa,
  updateTarefa,
  deleteTarefa,
} from 'services/tarefaService';
import Button from 'react-bootstrap/Button';
import TarefaModal from 'components/Tarefa/TarefaModal';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';

import './styles.css';
import TarefaDetailsCard from 'components/Tarefa/TarefaDetailsCard';

const TarefaPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUsersAndProjetoDTO | null>(null);
  const [tarefas, setTarefas] = useState<TarefaWithUsersAndProjetoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tarefaToEdit, setTarefaToEdit] =
    useState<TarefaWithUsersAndProjetoDTO | null>(null);

  useEffect(() => {
    fetchTarefas();
  }, []);

  const fetchTarefas = async () => {
    setIsLoading(true);
    try {
      const detailedTarefas = await getAllTarefasWithUsersAndProjeto();
      setTarefas(detailedTarefas);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        className="d-flex justify-content-between align-items-center mb-4"
        style={{ marginLeft: '5%', marginRight: '7%' }}
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
