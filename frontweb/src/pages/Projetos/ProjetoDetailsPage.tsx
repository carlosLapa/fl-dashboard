import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import {
  getProjetoWithUsersAndTarefasAPI,
  updateProjetoStatusAPI,
  getExternosByProjetoIdAPI,
} from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';
import ExternoTable from 'components/Externo/ExternoTable';
import { NotificationType } from 'types/notification';
import { toast } from 'react-toastify';
import { useNotification } from 'NotificationContext';
import BackButton from 'components/Shared/BackButton';
import { Externo } from 'types/externo';
import './projetoDetailsPage.scss';

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [externos, setExternos] = useState<Externo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExternos, setIsLoadingExternos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [externosError, setExternosError] = useState<string | null>(null);
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

  const fetchExternos = async () => {
    if (projetoId) {
      setIsLoadingExternos(true);
      try {
        console.log('Fetching externos for projeto:', projetoId);
        const fetchedExternos = await getExternosByProjetoIdAPI(
          Number(projetoId)
        );
        console.log('Fetched externos:', fetchedExternos);
        if (Array.isArray(fetchedExternos)) {
          console.log(`Received ${fetchedExternos.length} externos from the API`);
          setExternos(fetchedExternos);
          setExternosError(null);
        } else {
          console.error('Received non-array response for externos:', fetchedExternos);
          setExternos([]);
          setExternosError('Formato de resposta inválido para colaboradores externos');
        }
      } catch (error) {
        console.error('Error fetching externos for projeto:', error);
        setExternosError('Erro ao carregar colaboradores externos');
      } finally {
        setIsLoadingExternos(false);
      }
    }
  };

  useEffect(() => {
    fetchProjeto();
    fetchExternos();
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
    <div className="projeto-details-page-container">
      <Container fluid className="py-3">
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="page-title mb-3">Detalhes do Projeto</h2>
            <div className="d-flex justify-content-start">
              <BackButton to="/projetos" />
            </div>
          </Col>
        </Row>

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

        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header as="h5">Colaboradores Externos Associados</Card.Header>
              <Card.Body className="p-0">
                {isLoadingExternos ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <span className="ms-2">
                      Carregando colaboradores externos...
                    </span>
                  </div>
                ) : externosError ? (
                  <Alert variant="danger" className="m-3">
                    {externosError}
                  </Alert>
                ) : (
                  <div className="details-table-wrapper">
                    <ExternoTable
                      externos={externos}
                      simplified={true}
                      showPagination={false}
                      onViewTasks={(id) => navigate(`/externos/${id}/tarefas`)}
                      onViewProjetos={(id) => navigate(`/externos/${id}/projetos`)}
                      // Uncomment these if you want edit/delete functionality in this view
                      // onEditExterno={(id) => navigate(`/externos/${id}/edit`)}
                      // onDeleteExterno={handleDeleteExterno}
                    />
                    <div className="mt-2 px-3 text-muted">
                      <small>
                        Colaboradores externos encontrados: {externos.length}
                      </small>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProjetoDetailsPage;
