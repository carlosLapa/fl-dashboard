import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';
import { TarefaWithUserAndProjetoDTO } from 'types/tarefa';
import { getTarefasWithUsersAndProjetoByUser } from 'api/requestsApi';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './userStyles.scss';

const UserCalendarPage: React.FC = () => {
  const [userTarefas, setUserTarefas] = useState<TarefaWithUserAndProjetoDTO[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  // Verifica se poderá ser necessário ainda
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const fetchUserTarefas = useCallback(async () => {
    setIsLoading(true);
    try {
      if (userId) {
        const tarefas = await getTarefasWithUsersAndProjetoByUser(
          Number(userId)
        );
        setUserTarefas(tarefas.content);
      }
    } catch (error) {
      console.error('Error fetching user tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserTarefas();
  }, [fetchUserTarefas]);

  const handleGoBack = () => {
    navigate(`/users/${userId}/tarefas`);
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="page-container" style={{ marginTop: '2rem' }}>
      {/* Wrap the content in a div with consistent width and margins */}
      <div
        style={{
          width: '98%',
          marginLeft: '2%',
          marginRight: '2%',
          marginTop: '2rem',
        }}
      >
        <div
          className="page-title-container"
          style={{ width: '100%', margin: 0 }}
        >
          <h2 className="page-title">O Meu Calendário</h2>
          <div className="page-actions">
            <Button
              variant="primary"
              onClick={handleGoBack}
              className="create-button"
            >
              Ver Tabela
            </Button>
          </div>
        </div>

        {/* Calendar wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <div className="calendar-wrapper">
            <TarefasCalendar tarefas={userTarefas} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCalendarPage;
