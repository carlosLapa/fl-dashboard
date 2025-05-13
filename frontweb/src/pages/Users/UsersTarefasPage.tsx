import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from 'services/userService';
import {
  getTarefasWithUsersAndProjetoByUser,
  updateTarefaAPI,
} from 'api/requestsApi';
import { User } from 'types/user';
import {
  TarefaWithUserAndProjetoDTO,
  TarefaUpdateFormData,
  TarefaInsertFormData,
} from 'types/tarefa';
import UserTarefaTable from 'components/User/UserTarefaTable';
import TarefaModal from 'components/Tarefa/TarefaModal';
import Button from 'react-bootstrap/Button';
import './userStyles.scss';

const UsersTarefasPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [tarefas, setTarefas] = useState<TarefaWithUserAndProjetoDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showTarefaModal, setShowTarefaModal] = useState(false);
  const [selectedTarefa, setSelectedTarefa] =
    useState<TarefaWithUserAndProjetoDTO | null>(null);

  useEffect(() => {
    const fetchUserAndTarefas = async () => {
      try {
        if (userId) {
          console.log(`Starting data fetch for user ${userId}`);
          const parsedUserId = parseInt(userId, 10);
          const [userData, userTarefas] = await Promise.all([
            getUserById(parsedUserId),
            getTarefasWithUsersAndProjetoByUser(parsedUserId),
          ]);
          console.log(`Completed data fetch for user ${userId}`);
          setUser(userData);
          setTarefas(userTarefas.content);
        }
      } catch (err) {
        setError('Failed to fetch user data or tarefas');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndTarefas();
  }, [userId]);

  const handleNavigateToCalendar = () => {
    navigate(`/user-calendar/${userId}`);
  };

  const handleEditTarefa = (tarefaId: number) => {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (tarefa) {
      setSelectedTarefa(tarefa);
      setShowTarefaModal(true);
    }
  };

  const handleDeleteTarefa = (tarefaId: number) => {
    console.log(`Delete tarefa with id: ${tarefaId}`);
  };

  const handleCloseTarefaModal = () => {
    setShowTarefaModal(false);
    setSelectedTarefa(null);
  };

  const handleSaveTarefa = async (
    formData: TarefaInsertFormData | TarefaUpdateFormData
  ) => {
    try {
      if ('id' in formData) {
        const updatedTarefa = await updateTarefaAPI(formData.id, formData);
        setTarefas((prevTarefas) =>
          prevTarefas.map((t) =>
            t.id === updatedTarefa.id ? updatedTarefa : t
          )
        );
      } else {
        // Handle insert case if needed
        console.log('Insert case not handled in this context');
      }
      handleCloseTarefaModal();
    } catch (error) {
      console.error('Error updating tarefa:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  if (loading) {
    return <div className="loading-container">A carregar...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (!user) {
    return (
      <div className="not-found-container">Colaborador não encontrado</div>
    );
  }

  return (
    <div className="user-tarefas-page">
      <div className="user-tarefas-container">
        <div className="user-info-section">
          <div className="user-info-container">
            <div className="user-image-container">
              {user.profileImage ? (
                <img
                  src={`data:image/jpeg;base64,${user.profileImage}`}
                  alt={`${user.name}`}
                  className="user-profile-image"
                />
              ) : (
                <div className="user-profile-placeholder">No Image</div>
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
          </div>
          <div className="tarefas-header">
            <h2 className="tarefas-title">Tarefas atribuídas</h2>
            <div className="calendar-button-container">
              <Button variant="primary" onClick={handleNavigateToCalendar}>
                Ver Calendário
              </Button>
            </div>
          </div>
        </div>
        <div className="tarefas-table-section">
          <UserTarefaTable
            tarefas={tarefas}
            onEditTarefa={handleEditTarefa}
            onDeleteTarefa={handleDeleteTarefa}
          />
        </div>
      </div>
      {showTarefaModal && selectedTarefa && (
        <TarefaModal
          show={showTarefaModal}
          onHide={handleCloseTarefaModal}
          tarefa={selectedTarefa}
          onSave={handleSaveTarefa}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default UsersTarefasPage;
