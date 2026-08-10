import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getUserById } from 'services/userService';
import { getProjetoUserHistory } from '../../services/projetoUserHistoryService';
import { User } from 'types/user';
import { ProjetoUserHistoryTimelineDTO } from '../../types/projetoUserHistory';
import ProjectAssignmentTimelineChart from '../../components/User/ProjectAssignmentTimelineChart';
import ProjetoAssignmentHistoryTable from '../../components/User/ProjetoAssignmentHistoryTable';
import ProjetoTimeSpentTable from '../../components/User/ProjetoTimeSpentTable';

const UserProjetoHistoryPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ProjetoUserHistoryTimelineDTO | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('ID do colaborador não fornecido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedUserId = parseInt(userId, 10);
      const [userData, historyData] = await Promise.all([
        getUserById(parsedUserId),
        getProjetoUserHistory(parsedUserId),
      ]);
      setUser(userData);
      setHistory(historyData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGoBack = useCallback(() => {
    navigate('/users');
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div style={{ width: '98%', marginLeft: '2%', marginTop: '2rem' }}>
          <div className="text-center" style={{ padding: '3rem' }}>
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">A carregar histórico...</span>
            </Spinner>
            <p className="mt-3 text-muted">A carregar histórico de projetos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user || !history) {
    return (
      <div className="page-container" style={{ marginTop: '2rem' }}>
        <div style={{ width: '98%', marginLeft: '2%', marginTop: '2rem' }}>
          <Alert variant="danger">
            <Alert.Heading>Erro ao Carregar Histórico</Alert.Heading>
            <p>{error || 'Não foi possível carregar o histórico.'}</p>
            <hr />
            <div className="d-flex justify-content-between">
              <Button variant="outline-danger" onClick={handleGoBack}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Voltar
              </Button>
              <Button variant="primary" onClick={fetchData}>
                Tentar Novamente
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      <div
        style={{
          width: '94%',
          marginLeft: '2%',
          marginRight: '4%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleGoBack}
              className="me-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <div>
              <h2 className="page-title mb-1">
                Histórico de Projetos: {user.name}
              </h2>
              <p className="text-muted mb-0">
                Atribuições e remoções de projetos ao longo do tempo.
                Histórico disponível apenas a partir da data de introdução
                desta funcionalidade.
              </p>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', marginTop: '3rem' }}>
          <ProjectAssignmentTimelineChart
            projetosAtivosPorMes={history.projetosAtivosPorMes}
          />
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          <ProjetoTimeSpentTable tempoPorProjeto={history.tempoPorProjeto} />
        </div>

        <div style={{ width: '100%', marginTop: '2rem' }}>
          <ProjetoAssignmentHistoryTable eventos={history.eventos} />
        </div>
      </div>
    </div>
  );
};

export default UserProjetoHistoryPage;
