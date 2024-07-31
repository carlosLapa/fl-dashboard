import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjetoKanbanBoard from '../../components/Tarefa/ProjetoKanbanBoard';
import { getProjetoWithUsersAndTarefas } from '../../services/projetoService';
import { ProjetoWithUsersAndTarefasDTO } from '../../types/projeto';

const KanbanBoardPage: React.FC = () => {
  const { projetoId } = useParams<{ projetoId: string }>();
  const [projeto, setProjeto] = useState<ProjetoWithUsersAndTarefasDTO | null>(
    null
  );

  useEffect(() => {
    const loadProject = async () => {
      if (projetoId) {
        const projetoData = await getProjetoWithUsersAndTarefas(
          Number(projetoId)
        );
        setProjeto(projetoData);
      }
    };
    loadProject();
  }, [projetoId]);

  if (!projeto) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="home-container flex-grow-1">
      {' '}
      <div className="kanban-board-page">
        <h1>{projeto.designacao} - Kanban Board</h1>
        <ProjetoKanbanBoard projeto={projeto} />{' '}
      </div>{' '}
    </div>
  );
};

export default KanbanBoardPage;
