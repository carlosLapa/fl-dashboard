import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { getProjetoWithUsersAndTarefasAPI } from 'api/requestsApi';
import ProjetoDetailsTable from 'components/Projeto/ProjetoDetailsTable';
import { ProjetoWithUsersAndTarefasDTO } from 'types/projeto';
import ProjetoTarefasTable from 'components/Projeto/ProjetoTarefasTable';

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

  const handleGoBack = () => {
    navigate('/projetos');
  };

  if (!projeto) {
    return <div>Loading...</div>;
  }

  return (
    <div className="projeto-details-container">
      <h2>Detalhes do Projeto</h2>
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
