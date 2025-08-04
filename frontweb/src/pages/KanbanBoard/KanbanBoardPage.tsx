import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import ProjetoKanbanBoard from '../../components/Tarefa/ProjetoKanbanBoard';
import { getProjetoWithUsersAndTarefasAPI } from '../../api/requestsApi';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import BackButton from '../../components/Shared/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './kanbanStyles.scss';

const KanbanBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    'permission' | 'notFound' | 'general' | null
  >(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projetoId) return;

      setIsLoading(true);
      try {
        // Directly call the API to get detailed project data
        const projetoData = await getProjetoWithUsersAndTarefasAPI(
          Number(projetoId)
        );
        setProjeto(projetoData);
        setError(null);
        setErrorType(null);
      } catch (err) {
        console.error('Error loading project:', err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 403) {
            setError('Você não tem permissão para visualizar este projeto.');
            setErrorType('permission');
          } else if (err.response?.status === 404) {
            setError('Projeto não encontrado ou foi excluído.');
            setErrorType('notFound');
          } else {
            setError('Erro ao carregar o projeto. Por favor, tente novamente.');
            setErrorType('general');
          }
        } else {
          setError('Erro ao carregar o projeto. Por favor, tente novamente.');
          setErrorType('general');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projetoId]);

  return (
    <main className="home-container flex-grow-1">
      <Container fluid className="px-0">
        <section className="kanban-board-page">
          <Row className="mb-4">
            <Col>
              <div className="d-flex align-items-center">
                <BackButton to="/projetos" />
                <h1 className="kanban-board-title mb-0">
                  {isLoading
                    ? 'Carregando...'
                    : projeto?.designacao || 'Projeto'}{' '}
                  - Kanban Board
                </h1>
              </div>
            </Col>
          </Row>

          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">A carregar...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert
              variant={
                errorType === 'permission'
                  ? 'danger'
                  : errorType === 'notFound'
                  ? 'warning'
                  : 'danger'
              }
              className="mb-3"
            >
              <Alert.Heading>
                {errorType === 'permission'
                  ? 'Acesso Negado'
                  : errorType === 'notFound'
                  ? 'Projeto Não Encontrado'
                  : 'Erro'}
              </Alert.Heading>
              <p>{error}</p>
              {errorType === 'permission' && (
                <p>
                  Não está associado a este projeto ou não possui as
                  permissões necessárias.
                </p>
              )}
              {errorType === 'notFound' && (
                <p>
                  O projeto solicitado pode ter sido excluído ou não existe no
                  sistema.
                </p>
              )}
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/projetos')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Voltar para Projetos
                </Button>
              </div>
            </Alert>
          ) : projeto ? (
            <ProjetoKanbanBoard projeto={projeto} />
          ) : (
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>Projeto não encontrado</Alert.Heading>
              <p>Não foi possível encontrar informações sobre este projeto.</p>
              <div className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/projetos')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                  Voltar para Projetos
                </Button>
              </div>
            </Alert>
          )}
        </section>
      </Container>
    </main>
  );
};

export default KanbanBoardPage;
