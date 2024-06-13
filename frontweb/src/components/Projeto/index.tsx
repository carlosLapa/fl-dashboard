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
        setProjetos(response.data);
      } catch (error) {
        console.error('Erro ao carregar os projetos:', error);
      }
    };
    fetchProjetos();
  }, []);

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Projetos</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Ano</th>
            <th>Designação</th>
            <th>Entidade</th>
            <th>Prioridade</th>
            <th>Observação</th>
            <th>Prazo</th>
          </tr>
        </thead>
        <tbody>
          {projetos.map((projeto) => (
            <tr key={projeto.id}>
              <td>{projeto.designacao}</td>
              <td>{projeto.entidade}</td>
              <td>{projeto.entidade}</td>
              <td>{projeto.observacao}</td>
              <td>{projeto.prazo}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default ProjetoTable;
