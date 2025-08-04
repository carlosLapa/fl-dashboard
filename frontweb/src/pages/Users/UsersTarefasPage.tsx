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
import { useAuth } from '../../AuthContext'; // Add this import
import './userStyles.scss';

const UsersTarefasPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth(); // Get current user from context
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
        if (!userId || !currentUser) return;

        // If Employee and viewing own page, use /users/me
        const isEmployee =
          currentUser.roles &&
          Array.isArray(currentUser.roles) &&
          currentUser.roles.some(
            (role: any) =>
              role.authority === 'ROLE_EMPLOYEE' || role === 'ROLE_EMPLOYEE'
          );
        const isOwnPage = currentUser.id?.toString() === userId;

        let userData;
        if (isEmployee && isOwnPage) {
          // Fetch from /users/me
          const { getCurrentUserWithRoles } = await import(
            'services/userService'
          );
          userData = await getCurrentUserWithRoles();
        } else {
          // Fetch from /users/{id}
          const parsedUserId = parseInt(userId, 10);
          userData = await getUserById(parsedUserId);
        }

        // Fetch tarefas as before
        const parsedUserId = parseInt(userId, 10);
        const userTarefas = await getTarefasWithUsersAndProjetoByUser(
          parsedUserId
        );

        setUser({
          ...userData,
          profileImage:
            userData.profileImage && userData.profileImage.trim() !== ''
              ? userData.profileImage
              : '',
        });
        setTarefas(userTarefas.content);
      } catch (err) {
        setError('Failed to fetch user data or tarefas');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndTarefas();
  }, [userId, currentUser]);

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
    return <div className="error-container">Erro: {error}</div>;
  }

  if (!user) {
    return (
      <div className="not-found-container">Colaborador não encontrado</div>
    );
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
          <div
            className="user-info-container"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <div
              className="user-image-container"
              style={{ marginRight: '1.5rem' }}
            >
              {user.profileImage && user.profileImage.trim() !== '' ? (
                <img
                  src={`data:image/jpeg;base64,${user.profileImage}`}
                  alt={`${user.name}`}
                  className="user-profile-image"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <div
                  className="user-profile-placeholder"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  No Image
                </div>
              )}
            </div>
            <div className="user-details">
              <h2 className="page-title" style={{ margin: 0 }}>
                {user.name}
              </h2>
              <p className="user-email" style={{ margin: 0 }}>
                {user.email}
              </p>
            </div>
          </div>
          <div className="page-actions" style={{ alignSelf: 'flex-start' }}>
            <Button variant="primary" onClick={handleNavigateToCalendar}>
              Ver Calendário
            </Button>
          </div>
        </div>

        {/* Content wrapped in a div with the same width */}
        <div style={{ width: '100%', marginTop: '3rem' }}>
          <h3
            className="section-title user-tasks-section-title"
            style={{
              borderBottom: 'none',
              paddingBottom: 0,
              position: 'relative',
            }}
          >
            Tarefas atribuídas
          </h3>
          <div className="table-responsive">
            <UserTarefaTable
              tarefas={tarefas}
              onEditTarefa={handleEditTarefa}
              onDeleteTarefa={handleDeleteTarefa}
            />
          </div>
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
