import React, { useState, useEffect } from 'react';
import TarefaTable from 'components/Tarefa/TarefaTable';
import { TarefaWithUsersAndProjetoDTO } from 'types/tarefa';
import { getAllTarefasWithUsersAndProjeto } from 'services/tarefaService';

const TarefaPage: React.FC = () => {
  const [tarefas, setTarefas] = useState<TarefaWithUsersAndProjetoDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTarefas();
  }, []);

  const fetchTarefas = async () => {
    setIsLoading(true);
    try {
      const detailedTarefas = await getAllTarefasWithUsersAndProjeto();
      setTarefas(detailedTarefas);
    } catch (error) {
      console.error('Error fetching tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTarefa = (tarefaId: number) => {
    console.log('Edit tarefa:', tarefaId);
  };

  const handleDeleteTarefa = (tarefaId: number) => {
    console.log('Delete tarefa:', tarefaId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Tarefas</h1>
      <TarefaTable
        tarefas={tarefas}
        onEditTarefa={handleEditTarefa}
        onDeleteTarefa={handleDeleteTarefa}
      />
    </div>
  );
};

export default TarefaPage;
