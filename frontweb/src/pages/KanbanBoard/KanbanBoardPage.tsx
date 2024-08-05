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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (projetoId) {
        try {
          const projetoData = await getProjetoWithUsersAndTarefas(
            Number(projetoId)
          );
          setProjeto(projetoData);
        } catch (err) {
          setError('Failed to load project. Please try again.');
        }
      }
    };
    loadProject();
  }, [projetoId]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!projeto) {
    return <div className="loading-message">Loading project...</div>;
  }

  return (
    <main className="home-container flex-grow-1">
      <section className="kanban-board-page">
        <h1>{projeto.designacao} - Kanban Board</h1>
        <ProjetoKanbanBoard projeto={projeto} />
      </section>
    </main>
  );
};

export default KanbanBoardPage;
