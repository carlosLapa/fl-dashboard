import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Button } from 'react-bootstrap';
import {
  getProjetoWithUsersAndTarefasAPI,
  updateProjetoStatusAPI,
} from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';
import ProjetoTarefasArquivadasTable from 'components/Projeto/ProjetoTarefasArquivadasTable';
import ProjetoTarefaModal from 'components/Tarefa/ProjetoTarefaModal';
import TarefaModal from 'components/Tarefa/TarefaModal';
import {
  Tarefa,
  TarefaInsertFormData,
  TarefaUpdateFormData,
} from 'types/tarefa';
import { addTarefa, updateTarefa } from 'services/tarefaService';
import { toast } from 'react-toastify';
import BackButton from 'components/Shared/BackButton/BackButton';
import ProjetoExternosManager from 'components/Projeto/ProjetoExternosManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faColumns } from '@fortawesome/free-solid-svg-icons';
import './projetoDetailsPage.scss';

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para o modal de nova tarefa
  const [showTarefaModal, setShowTarefaModal] = useState(false);

  // Estados para o modal de edição de tarefa
  const [showEditTarefaModal, setShowEditTarefaModal] = useState(false);
  const [tarefaToEdit, setTarefaToEdit] = useState<Tarefa | null>(null);

  const fetchProjeto = async () => {
    if (projetoId) {
      setIsLoading(true);
      try {
        const fetchedProjeto = await getProjetoWithUsersAndTarefasAPI(
          Number(projetoId)
        );
        setProjeto(fetchedProjeto);
        setError(null);
      } catch (error) {
        console.error('Error fetching projeto details:', error);
        setError('Erro ao carregar detalhes do projeto');
        toast.error('Erro ao carregar detalhes do projeto');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProjeto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoId]);

  // Handler para adicionar nova tarefa
  const handleAddTarefa = async (formData: TarefaInsertFormData) => {
    try {
      await addTarefa(formData);
      toast.success('Tarefa criada com sucesso!');
      // Recarregar os dados do projeto para mostrar a nova tarefa
      await fetchProjeto();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);

      // Verificar se é um erro específico de validação de prazo
      if (error instanceof Error && error.message.includes('prazo')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao adicionar tarefa');
      }
    }
  };

  // Handler para abrir o modal de edição de uma tarefa existente
  const handleEditTarefa = (tarefaId: number) => {
    const tarefa = projeto?.tarefas.find((t) => t.id === tarefaId);
    if (tarefa) {
      setTarefaToEdit(tarefa);
      setShowEditTarefaModal(true);
    }
  };

  // Handler para gravar a edição de uma tarefa
  const handleUpdateTarefa = async (formData: TarefaUpdateFormData) => {
    try {
      await updateTarefa(formData.id, formData);
      toast.success('Tarefa atualizada com sucesso!');
      setShowEditTarefaModal(false);
      setTarefaToEdit(null);
      await fetchProjeto();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      if (error instanceof Error && error.message.includes('prazo')) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar tarefa');
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (projetoId && projeto) {
      try {
        await updateProjetoStatusAPI(Number(projetoId), newStatus);
        await fetchProjeto();
        toast.success('Status do projeto atualizado com sucesso!');
      } catch (error) {
        console.error('Error updating projeto status:', error);
        toast.error('Erro ao atualizar status do projeto');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!projeto) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Projeto não encontrado</Alert>
      </Container>
    );
  }

  return (
    <div className="page-container projeto-details-container">
      <div className="page-shell">
        <div className="page-title-container">
          <h2 className="page-title">Detalhes do Projeto</h2>
          <div className="page-actions">
            <BackButton to="/projetos" />
            <Button
              variant="primary"
              onClick={() => setShowTarefaModal(true)}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Nova Tarefa
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => navigate(`/projetos/${projetoId}/full`)}
            >
              <FontAwesomeIcon icon={faColumns} className="me-2" />
              Kanban
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="details-table-wrapper">
            <ProjetoDetailsTable
              projeto={projeto}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        <div className="mb-4">
          <Card>
            <Card.Header as="h5">Tarefas Associadas</Card.Header>
            <Card.Body className="p-0">
              <div className="details-table-wrapper">
                <ProjetoTarefasTable
                  tarefas={projeto.tarefas}
                  onEditTarefa={handleEditTarefa}
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="mb-4">
          <Card>
            <Card.Header as="h5">Tarefas Arquivadas</Card.Header>
            <Card.Body className="p-0">
              <div className="details-table-wrapper">
                <ProjetoTarefasArquivadasTable
                  projetoId={projeto.id}
                  onReactivated={fetchProjeto}
                />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Substitua a seção anterior de Colaboradores Externos pelo ProjetoExternosManager */}
        <div className="mb-4">
          {projeto.id && (
            <ProjetoExternosManager
              projetoId={projeto.id}
              onUpdate={fetchProjeto}
            />
          )}
        </div>
      </div>

      {showTarefaModal && (
        <ProjetoTarefaModal
          show={showTarefaModal}
          onHide={() => setShowTarefaModal(false)}
          onSave={handleAddTarefa}
          projetoId={projeto.id}
        />
      )}

      {showEditTarefaModal && (
        <TarefaModal
          show={showEditTarefaModal}
          onHide={() => {
            setShowEditTarefaModal(false);
            setTarefaToEdit(null);
          }}
          onSave={(formData) =>
            handleUpdateTarefa(formData as TarefaUpdateFormData)
          }
          isEditing
          tarefa={tarefaToEdit}
        />
      )}
    </div>
  );
};

export default ProjetoDetailsPage;
