import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import ProjetoKanbanBoard from '../../components/Tarefa/ProjetoKanbanBoard';
import { getProjetoWithUsersAndTarefas } from '../../services/projetoService';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';
import BackButton from '../../components/Shared/BackButton';
import './kanbanStyles.scss';

const KanbanBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (projetoId) {
        setIsLoading(true);
        try {
          const projetoData = await getProjetoWithUsersAndTarefas(
            Number(projetoId)
          );
          setProjeto(projetoData);
          setError(null);
        } catch (err) {
          console.error('Error loading project:', err);
          setError('Falha ao carregar o projeto. Por favor, tente novamente.');
        } finally {
          setIsLoading(false);
        }
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
                  {isLoading ? 'Carregando...' : projeto?.designacao} - Kanban
                  Board
                </h1>
              </div>
            </Col>
          </Row>

          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : projeto ? (
            <ProjetoKanbanBoard projeto={projeto} />
          ) : (
            <Alert variant="warning">Projeto não encontrado</Alert>
          )}
        </section>
      </Container>
    </main>
  );
};

export default KanbanBoardPage;
