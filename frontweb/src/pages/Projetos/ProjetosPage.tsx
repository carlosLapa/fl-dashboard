import React, { useState, useEffect } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { getProjetos } from '../../services/projetoService';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import Button from 'react-bootstrap/Button';
import AdicionarProjetoModal from 'components/Projeto/AdicionarProjetoModal';
import EditProjetoModal from 'components/Projeto/EditProjetoModal';
import { addProjetoAPI, updateProjetoAPI } from 'api/requestsApi';

import './styles.css';

const ProjetosPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);

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
    setShowEditModal(true);
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

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      <div className="d-flex justify-content-end mb-4">
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="add-project-btn"
        >
          Adicionar Projeto
        </Button>
      </div>
      {isLoading ? (
        <p>A carregar...</p>
      ) : (
        <ProjetoTable projetos={projetos} onEditProjeto={handleEditProjeto} />
      )}
      <AdicionarProjetoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddProjeto}
      />
      <EditProjetoModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        projeto={projetoToEdit}
        onSave={onSaveEditedProjeto}
      />
    </div>
  );
};

export default ProjetosPage;
