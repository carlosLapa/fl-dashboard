import React, { useState, useEffect } from 'react';
import TarefaTable from 'components/Tarefa/TarefaTable';
import {
  TarefaWithUsersAndProjetoDTO,
  TarefaFormData,
  TarefaInsertFormData,
  TarefaUpdateFormData,
} from 'types/tarefa';
import {
  getAllTarefasWithUsersAndProjeto,
  addTarefa,
  updateTarefa,
} from 'services/tarefaService';
import Button from 'react-bootstrap/Button';
import TarefaModal from 'components/Tarefa/TarefaModal';

import './styles.css';

const TarefaPage: React.FC = () => {
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
      console.error('Error fetching tarefas:', error);
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
      console.error('Error adding tarefa:', error);
    }
  };

  const handleUpdateTarefa = async (formData: TarefaUpdateFormData) => {
    try {
      await updateTarefa(formData.id, formData);
      await fetchTarefas();
      setShowModal(false);
      setTarefaToEdit(null);
    } catch (error) {
      console.error('Error updating tarefa:', error);
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

  const handleDeleteTarefa = (tarefaId: number) => {
    console.log('Delete tarefa:', tarefaId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Tarefas</h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="primary"
          onClick={() => {
            setTarefaToEdit(null);
            setShowModal(true);
          }}
          className="add-tarefa-btn"
        >
          Adicionar Tarefa
        </Button>
      </div>
      <TarefaTable
        tarefas={tarefas}
        onEditTarefa={handleEditTarefa}
        onDeleteTarefa={handleDeleteTarefa}
      />
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
    </div>
  );
};

export default TarefaPage;
