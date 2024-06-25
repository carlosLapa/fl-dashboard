import React, { useState, useEffect } from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { addProjeto, getProjetos, } from '../../services/projetoService';
import { getUsersAPI } from '../../api/requestsApi';
import ProjetoTable from '../../components/Projeto/ProjetoTable';
import Button from 'react-bootstrap/Button';
import AdicionarProjetoModal from 'components/Projeto/AdicionarProjetoModal';

const ProjetosPage: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const projetosData = await getProjetos();
      const usersData = await getUsersAPI();
      setProjetos(projetosData);
      setUsers(usersData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAddProjeto = async (projeto: Projeto) => {
    try {
      await addProjeto(projeto);
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
      {isLoading ? (
        <p>A carregar...</p>
      ) : (
        <ProjetoTable projetos={projetos} users={users} />
      )}
      <AdicionarProjetoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleAddProjeto}
      />
    </div>
  );
};

export default ProjetosPage;
