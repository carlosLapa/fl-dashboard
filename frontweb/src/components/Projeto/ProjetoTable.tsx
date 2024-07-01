import React from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { Table, Button } from 'react-bootstrap';

import './styles.css';

export interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (projeto: Projeto) => void;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderUserNames = (users: User[]) => {
    return users.map((user) => user.username).join(', ');
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
              <th>Ações</th>
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
                <td>{renderUserNames(projeto.users)}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => onEditProjeto(projeto)}
                  >
                    Editar
                  </Button>
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
