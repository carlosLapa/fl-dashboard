import React, { useState, useEffect } from 'react';
import { Projeto } from '../../types/projeto';
import { fetchProjetos } from '../../services/projetoService';
import ProjetoTable from '../../components/Projeto/ProjetoTable';

const ProjetosPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const projetosData = await fetchProjetos();
      setProjetos(projetosData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // isLoading temporário

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      {isLoading ? <p>A carregar...</p> : <ProjetoTable projetos={projetos} />}
    </div>
  );
};

export default ProjetosPage;
