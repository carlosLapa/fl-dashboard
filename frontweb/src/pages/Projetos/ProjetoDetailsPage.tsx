import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
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

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const navigate = useNavigate();
  const { sendNotification } = useNotification();

  const fetchProjeto = async () => {
    if (projetoId) {
      try {
        const fetchedProjeto = await getProjetoWithUsersAndTarefasAPI(
          Number(projetoId)
        );
        setProjeto(fetchedProjeto);
      } catch (error) {
        console.error('Error fetching projeto details:', error);
        toast.error('Erro ao carregar detalhes do projeto');
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

  const handleGoBack = () => {
    navigate('/projetos');
  };

  if (!projeto) {
    return <div>Loading...</div>;
  }

  return (
    <div className="projeto-details-container">
      <h2>Detalhes do Projeto</h2>
      <ProjetoDetailsTable
        projeto={projeto}
        onStatusChange={handleStatusChange}
      />
      <h3>Tarefas Associadas</h3>
      <ProjetoTarefasTable tarefas={projeto.tarefas} />
      <Button variant="primary" onClick={handleGoBack}>
         Voltar para Lista de Projetos
      </Button>
    </div>
  );
};

export default ProjetoDetailsPage;
