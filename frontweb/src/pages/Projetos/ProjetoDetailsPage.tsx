import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import {
  getProjetoWithUsersAndTarefasAPI,
  updateProjetoStatusAPI,
} from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';
import { useNotification } from 'NotificationContext';
import BackButton from 'components/Shared/BackButton';

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { sendNotification } = useNotification();

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
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '200px' }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <BackButton to="/projetos" />
      </Container>
    );
  }

  if (!projeto) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Projeto não encontrado</Alert>
        <BackButton to="/projetos" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="mb-4">
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="page-title mb-3">Detalhes do Projeto</h2>
            <div className="d-flex justify-content-start">
              <BackButton to="/projetos" />
            </div>
          </Col>
        </Row>
      </Row>
      <Row className="mb-4">
        <Col>
          <ProjetoDetailsTable
            projeto={projeto}
            onStatusChange={handleStatusChange}
          />
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header as="h5">Tarefas Associadas</Card.Header>
            <Card.Body>
              <ProjetoTarefasTable tarefas={projeto.tarefas} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjetoDetailsPage;
