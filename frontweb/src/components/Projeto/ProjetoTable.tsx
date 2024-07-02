import React from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import './ProjetoTable.css';

export interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (projeto: Projeto) => void;
  onDeleteProjeto: (projetoId: number) => void;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
  onDeleteProjeto,
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
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    onClick={() => onEditProjeto(projeto)}
                    className="mr-2 edit-icon"
                  />
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    onClick={() => onDeleteProjeto(projeto.id)}
                    className="delete-icon"
                  />
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
