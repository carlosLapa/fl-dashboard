import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  Button,
} from 'react-bootstrap';
import {
  getProjetoWithUsersAndTarefasAPI,
  updateProjetoStatusAPI,
} from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';
import ProjetoTarefaModal from 'components/Tarefa/ProjetoTarefaModal';
import { TarefaInsertFormData } from 'types/tarefa';
import { addTarefa } from 'services/tarefaService';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';
import { useNotification } from 'NotificationContext';
import BackButton from 'components/Shared/BackButton/BackButton';
import ProjetoExternosManager from 'components/Projeto/ProjetoExternosManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './projetoDetailsPage.scss';

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sendNotification } = useNotification();

  // Estados para o modal de nova tarefa
  const [showTarefaModal, setShowTarefaModal] = useState(false);

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
      await addTarefa(formData, async (notification) => {
        sendNotification(notification);
        return Promise.resolve();
      });
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

  const handleStatusChange = async (newStatus: string) => {
    if (projetoId && projeto) {
      try {
        await updateProjetoStatusAPI(Number(projetoId), newStatus);
        projeto.users.forEach((user) => {
          const notification = {
            type: NotificationType.PROJETO_ATUALIZADO,
            content: `Status do projeto "${projeto.designacao}" foi atualizado para ${newStatus}`,
            userId: user.id,
            projetoId: Number(projetoId),
            tarefaId: 0, // Required by NotificationInsertDTO
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedId: Number(projetoId),
          };
          sendNotification(notification);
        });
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
    <Container className="mt-4 projeto-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Detalhes do Projeto</h2>
        <div className="d-flex">
          <div className="me-2">
            <BackButton to="/projetos" />
          </div>
          <Button variant="primary" onClick={() => setShowTarefaModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col>
          <div className="details-table-wrapper">
            <ProjetoDetailsTable
              projeto={projeto}
              onStatusChange={handleStatusChange}
            />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">Tarefas Associadas</Card.Header>
            <Card.Body className="p-0">
              <div className="details-table-wrapper">
                <ProjetoTarefasTable tarefas={projeto.tarefas} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Substitua a seção anterior de Colaboradores Externos pelo ProjetoExternosManager */}
      <Row className="mb-4">
        <Col>
          {projeto.id && (
            <ProjetoExternosManager
              projetoId={projeto.id}
              onUpdate={fetchProjeto}
            />
          )}
        </Col>
      </Row>

      {showTarefaModal && (
        <ProjetoTarefaModal
          show={showTarefaModal}
          onHide={() => setShowTarefaModal(false)}
          onSave={handleAddTarefa}
          projetoId={projeto.id}
        />
      )}
    </Container>
  );
};

export default ProjetoDetailsPage;
