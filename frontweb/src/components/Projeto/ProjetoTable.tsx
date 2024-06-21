// ProjetoTable.tsx
import React from 'react';
import Table from 'react-bootstrap/Table';
import { Projeto } from '../../types/projeto';

import './styles.css';

interface ProjetoTableProps {
  projetos: Projeto[];
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({ projetos }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="projeto-container">
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
        <p>Não foram encontrados projetos.</p>
      )}
    </div>
  );
};

export default ProjetoTable;
