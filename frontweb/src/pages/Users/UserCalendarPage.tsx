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
    <div className="my-calendar-container">
      <div className="d-flex justify-content-start align-items-center mb-3">
        <h2 className="my-calendar-text-title me-auto">O Meu Calendário</h2>
        <Button variant="primary" onClick={handleGoBack}>
          Ver Tabela
        </Button>
      </div>
      <div className="calendar-wrapper">
        <TarefasCalendar tarefas={userTarefas} />
      </div>
    </div>
  );
};

export default UserCalendarPage;
