import React from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUsersAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './styles.css';

interface TarefaTableProps {
  tarefas: TarefaWithUsersAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
}) => {
  return (
    <div className="tarefa-container">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Status</th>
            <th>Prazo Estimado</th>
            <th>Prazo Real</th>
            <th>Atribuição</th>
            <th>Projeto</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(tarefas) ? (
            tarefas.map((tarefa) => (
              <tr key={tarefa.id}>
                <td>{tarefa.descricao}</td>
                <td>{tarefa.status}</td>
                <td>{new Date(tarefa.prazoEstimado).toLocaleDateString()}</td>
                <td>{new Date(tarefa.prazoReal).toLocaleDateString()}</td>
                <td>{tarefa.users.map((user) => user.name).join(', ')}</td>
                <td>{tarefa.projeto.designacao}</td>
                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`edit-tooltip-${tarefa.id}`}>Editar</Tooltip>
                    }
                  >
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      onClick={() => onEditTarefa(tarefa.id)}
                      className="mr-2 edit-icon"
                    />
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`edit-tooltip-${tarefa.id}`}>Apagar</Tooltip>
                    }
                  >
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      onClick={() => onDeleteTarefa(tarefa.id)}
                      className="delete-icon"
                    />
                  </OverlayTrigger>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>Não existem tarefas</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TarefaTable;
