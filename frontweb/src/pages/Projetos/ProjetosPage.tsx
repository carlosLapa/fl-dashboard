// src/pages/Projetos/ProjetosPage.tsx
import React, { useState, useEffect } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { getProjetos } from '../../services/projetoService';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import Button from 'react-bootstrap/Button';
import ProjetoModal from 'components/Projeto/ProjetoModal';
import {
  addProjetoAPI,
  updateProjetoAPI,
  deleteProjetoAPI,
} from 'api/requestsApi';

import './styles.css';

const ProjetosPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const projetosData = await getProjetos();
      setProjetos(projetosData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAddProjeto = async (formData: ProjetoFormData) => {
    try {
      await addProjetoAPI(formData);
      const updatedProjetos = await getProjetos();
      setProjetos(updatedProjetos);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleEditProjeto = (projeto: Projeto) => {
    setProjetoToEdit(projeto);
    setShowModal(true);
    setIsEditing(true);
  };

  const handleAddNewProjeto = () => {
    setProjetoToEdit(null);
    setShowModal(true);
    setIsEditing(false);
  };

  const onSaveEditedProjeto = async (updatedProjeto: ProjetoFormData) => {
    try {
      if (projetoToEdit) {
        await updateProjetoAPI(projetoToEdit.id, updatedProjeto);
        const updatedProjetos = await getProjetos();
        setProjetos(updatedProjetos);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProjeto = async (projetoId: number) => {
    try {
      await deleteProjetoAPI(projetoId);
      const updatedProjetos = await getProjetos();
      setProjetos(updatedProjetos);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="primary"
          onClick={handleAddNewProjeto}
          className="add-project-btn"
        >
          Adicionar Projeto
        </Button>
      </div>
      <ProjetoTable
        projetos={projetos}
        onEditProjeto={handleEditProjeto}
        onDeleteProjeto={handleDeleteProjeto}
      />
      <ProjetoModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setProjetoToEdit(null);
          setIsEditing(false);
        }}
        projeto={projetoToEdit}
        onSave={isEditing ? onSaveEditedProjeto : handleAddProjeto}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ProjetosPage;
