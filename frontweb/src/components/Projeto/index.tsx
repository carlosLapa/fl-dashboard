import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { Projeto } from '../../types/projeto';
import { BASE_URL } from 'util/requests';

const ProjetoTable: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await axios.get(BASE_URL + '/projetos');
        const projetosData = response.data.content || [];
  
        if (Array.isArray(projetosData)) {
          const projetosWithUsernames = projetosData.map((projeto) => ({
            ...projeto,
            users:
              projeto.users?.map(
                ({ id, username }: { id: number; username: string }) => ({
                  id,
                  username,
                })
              ) || [],
          }));
  
          setProjetos(projetosWithUsernames);
        }
      } catch (error) {
        console.error('Erro ao carregar os projetos:', error);
      }
    };
  
    fetchProjetos();
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      {projetos.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Designação</th>
              <th>Entidade</th>
              <th>Prioridade</th>
              <th>Observação</th>
              <th>Prazo</th>
              <th>Colaboradores</th>
            </tr>
          </thead>
          <tbody>
            {projetos.map((projeto) => (
              <tr key={projeto.id}>
                <td>{projeto.projetoAno}</td>
                <td>{projeto.designacao}</td>
                <td>{projeto.entidade}</td>
                <td>{projeto.prioridade}</td>
                <td>{projeto.observacao}</td>
                <td>{formatDate(projeto.prazo)}</td>
                <td>
                  {projeto.users.map((user) => (
                    <div key={user.id}>{user.username}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
};

export default ProjetoTable;
