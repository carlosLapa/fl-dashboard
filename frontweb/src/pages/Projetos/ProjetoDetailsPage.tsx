import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import {
  getProjetoWithUsersAndTarefasAPI,
  getProjetosAPI,
  updateProjetoStatusAPI,
} from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';
import { toast } from 'react-toastify';

const ProjetoDetailsPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjeto = async () => {
      if (projetoId) {
        try {
          const fetchedProjeto = await getProjetoWithUsersAndTarefasAPI(
            Number(projetoId)
          );
          setProjeto(fetchedProjeto);
        } catch (error) {
          console.error('Error fetching projeto details:', error);
        }
      }
    };

    fetchProjeto();
  }, [projetoId]);

  const handleStatusChange = async (newStatus: string) => {
    if (projetoId) {
      try {
        await updateProjetoStatusAPI(Number(projetoId), newStatus);
        await getProjetosAPI();
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
      <div className="status-update-section mb-3">
        <Form.Group>
          <Form.Label>Status do Projeto</Form.Label>
          <Form.Select
            value={projeto.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="ATIVO">Ativo</option>
            <option value="EM_PROGRESSO">Em Progresso</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="SUSPENSO">Suspenso</option>
          </Form.Select>
        </Form.Group>
      </div>
      <ProjetoDetailsTable projeto={projeto} />
      <h3>Tarefas Associadas</h3>
      <ProjetoTarefasTable tarefas={projeto.tarefas} />
      <Button variant="primary" onClick={handleGoBack}>
        Voltar para Lista de Projetos
      </Button>
    </div>
  );
};

export default ProjetoDetailsPage;
