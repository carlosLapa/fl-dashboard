import React, { useState, useEffect } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { getProjetos } from '../../services/projetoService';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import { Button } from 'react-bootstrap';
import ProjetoModal from 'components/Projeto/ProjetoModal';
import {
  addProjetoAPI,
  updateProjetoAPI,
  deleteProjetoAPI,
} from 'api/requestsApi';
import { NotificationInsertDTO, NotificationType } from 'types/notification';
import { useNotification } from 'NotificationContext';
import { useAuth } from '../../AuthContext';
import './styles.css';

const ProjetosPage: React.FC = () => {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { sendNotification } = useNotification();

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
      // First create the project and get its response
      const newProjeto = await addProjetoAPI(formData);

      // Update the projects list
      const updatedProjetos = await getProjetos();
      setProjetos(updatedProjetos);

      // Only send notification if we have the new project data
      if (newProjeto && newProjeto.id) {
        sendNotification({
          type: NotificationType.PROJETO_ATRIBUIDO,
          content: `Novo projeto atribuído: ${newProjeto.designacao}`,
          userId: user?.id || 0,
          projetoId: newProjeto.id,
          tarefaId: 0,
          relatedId: 0,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
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

        setTimeout(() => {
          updatedProjeto.users.forEach((user) => {
            const notification: NotificationInsertDTO = {
              type: NotificationType.PROJETO_ATUALIZADO,
              content: `Projeto "${updatedProjeto.designacao}" foi atualizado`,
              userId: user.id,
              projetoId: projetoToEdit.id,
              tarefaId: 0,
              isRead: false,
              createdAt: new Date().toISOString(),
              relatedId: projetoToEdit.id,
            };
            sendNotification(notification);
          });
        }, 500);
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

  const filteredProjetos = projetos.filter((projeto) =>
    statusFilter === 'ALL' ? true : projeto.status === statusFilter
  );

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
        projetos={filteredProjetos}
        onEditProjeto={handleEditProjeto}
        onDeleteProjeto={handleDeleteProjeto}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
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
