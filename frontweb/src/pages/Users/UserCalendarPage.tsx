import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import TarefasCalendar from 'components/Tarefa/TarefasCalendar';
import { TarefaWithUsersAndProjetoDTO } from 'types/tarefa';
import { getTarefasWithUsersAndProjetoByUser } from 'api/requestsApi';
import { useNavigate, useParams } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

import './styles.css';

const UserCalendarPage: React.FC = () => {
  const [userTarefas, setUserTarefas] = useState<
    TarefaWithUsersAndProjetoDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    fetchUserTarefas();
  }, []);

  const fetchUserTarefas = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const tarefas = await getTarefasWithUsersAndProjetoByUser(user.id);
        setUserTarefas(tarefas);
      }
    } catch (error) {
      console.error('Error fetching user tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/users/${userId}/tarefas`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-calendar-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="my-calendar-text-title">O Meu Calendário</h2>
        <Button variant="primary" onClick={handleGoBack}>
          Ver Tabela
        </Button>
      </div>
      <TarefasCalendar tarefas={userTarefas} />
    </div>
  );
};

export default UserCalendarPage;
