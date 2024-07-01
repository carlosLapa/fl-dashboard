import React, { useState, useEffect } from 'react';
import { Projeto, ProjetoFormData } from '../../types/projeto';
import { addProjeto, getProjetos } from '../../services/projetoService';
import ProjetoTable, {
  ProjetoTableProps,
} from '../../components/Projeto/ProjetoTable';
import Button from 'react-bootstrap/Button';
import AdicionarProjetoModal from 'components/Projeto/AdicionarProjetoModal';
import { addProjetoAPI } from 'api/requestsApi';

const ProjetosPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const projetosData = await getProjetos();
      setProjetos(projetosData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAddProjeto = async (formData: ProjetoFormData) => {
    try {
      await addProjetoAPI(formData);
      const updatedProjetos = await getProjetos();
      setProjetos(updatedProjetos);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Adicionar Projeto
      </Button>
      {isLoading ? <p>A carregar...</p> : <ProjetoTable projetos={projetos} />}
      <AdicionarProjetoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddProjeto}
      />
    </div>
  );
};

export default ProjetosPage;
