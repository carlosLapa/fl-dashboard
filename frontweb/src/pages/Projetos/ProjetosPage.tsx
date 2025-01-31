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
  searchProjetosAPI,
  getProjetosAPI,
} from 'api/requestsApi';
import { NotificationInsertDTO, NotificationType } from 'types/notification';
import { useNotification } from 'NotificationContext';
import { useAuth } from '../../AuthContext';
import './styles.css';
const ProjetosPage: React.FC = () => {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [projetoToEdit, setProjetoToEdit] = useState<Projeto | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { sendNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjetos = async () => {
    const response = await getProjetos(page, pageSize);
    setProjetos(response.content);
    setTotalPages(response.totalPages);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setPage(0);
    const response = await searchProjetosAPI(
      query,
      statusFilter,
      page,
      pageSize
    );
    setProjetos(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchProjetos();
    }
  }, [page, pageSize]);

  const handleEditProjeto = (id: number) => {
    const projeto = projetos.find((p) => p.id === id);
    if (projeto) {
      setProjetoToEdit(projeto);
      setShowModal(true);
    }
  };

  const handleAddNewProjeto = () => {
    setProjetoToEdit(null);
    setShowModal(true);
  };

  const handleDeleteProjeto = async (id: number) => {
    try {
      await deleteProjetoAPI(id);
      await fetchProjetos();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleAddOrUpdateProjeto = async (formData: ProjetoFormData) => {
    try {
      if (projetoToEdit) {
        await updateProjetoAPI(projetoToEdit.id, formData);
        setTimeout(() => {
          formData.users.forEach((user) => {
            const notification: NotificationInsertDTO = {
              type: NotificationType.PROJETO_ATUALIZADO,
              content: `Projeto "${formData.designacao}" foi atualizado`,
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
      } else {
        const newProjeto = await addProjetoAPI(formData);
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
      }
      await fetchProjetos();
    } catch (error) {
      console.error('Error adding/updating project:', error);
    }
  };

  return (
    <div className="page-container">
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
        page={page}
        onPageChange={setPage}
        totalPages={totalPages}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <ProjetoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        projeto={projetoToEdit}
        onSave={handleAddOrUpdateProjeto}
        isEditing={!!projetoToEdit}
      />
    </div>
  );
};

export default ProjetosPage;
