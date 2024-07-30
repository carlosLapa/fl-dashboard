import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProjectKanbanBoard from '../../components/Task/ProjectKanbanBoard';
import { getProjetoById } from '../../services/projetoService';

interface ProjectDetails {
  id: number;
  nome: string;
  // Add other project properties as needed
}

const KanbanBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectDetails | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        const projectData = await getProjetoById(Number(projectId));
        setProject({
          id: projectData.id,
          nome: projectData.designacao || '',
        });
      }
    };
    loadProject();
  }, [projectId]);

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="kanban-board-page">
      <h1>{project.nome} Kanban Board</h1>
      <ProjectKanbanBoard projectId={project.id} />
    </div>
  );
};

export default KanbanBoardPage;
