import React from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './userTarefaTable.scss';

interface UserTarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
}

const UserTarefaTable: React.FC<UserTarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
}) => {
  return (
    <div className="tarefa-table-container">
      <div className="table-responsive">
        <Table striped bordered hover className="tarefa-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="d-none d-md-table-cell">Status</th>
              <th className="d-none d-md-table-cell">Prazo Estimado</th>
              <th className="d-none d-lg-table-cell">Prazo Real</th>
              <th className="d-none d-lg-table-cell">Projeto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {tarefas.length > 0 ? (
              tarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.descricao}</td>
                  <td className="d-none d-md-table-cell">{tarefa.status}</td>
                  <td className="d-none d-md-table-cell">
                    {new Date(tarefa.prazoEstimado).toLocaleDateString()}
                  </td>
                  <td className="d-none d-lg-table-cell">
                    {new Date(tarefa.prazoReal).toLocaleDateString()}
                  </td>
                  <td className="d-none d-lg-table-cell">
                    {tarefa.projeto.designacao}
                  </td>
                  <td>
                    <div className="action-icons">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`edit-tooltip-${tarefa.id}`}>
                            Editar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditTarefa(tarefa.id)}
                          className="action-icon edit-icon"
                          style={{ marginRight: '10px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`delete-tooltip-${tarefa.id}`}>
                            Apagar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteTarefa(tarefa.id)}
                          className="action-icon delete-icon"
                          style={{ marginLeft: '10px' }}
                        />
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  Não existem tarefas para este utilizador
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default UserTarefaTable;
