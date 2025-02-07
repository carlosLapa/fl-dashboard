import React from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import './styles.css';

interface TarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
  onViewDetails,
  page,
  totalPages,
  onPageChange,
  isLoading,
}) => {
  console.log('Tarefas in Table:', tarefas); // Add this debug log

  if (isLoading) {
    return <div className="text-center">Carregando tarefas...</div>;
  }

  const hasTarefas = Array.isArray(tarefas) && tarefas.length > 0;

  return (
    <div className="tarefa-container">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Status</th>
            <th className="prazo-column">Prazo Estimado</th>
            <th className="prazo-column">Prazo Real</th>
            <th>Atribuição</th>
            <th>Projeto</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {hasTarefas ? (
            tarefas.map((tarefa) => (
              <tr key={tarefa.id}>
                <td>{tarefa.descricao}</td>
                <td>{tarefa.status}</td>
                <td className="prazo-column">
                  {tarefa.prazoEstimado
                    ? new Date(tarefa.prazoEstimado).toLocaleDateString()
                    : '-'}
                </td>
                <td className="prazo-column">
                  {tarefa.prazoReal
                    ? new Date(tarefa.prazoReal).toLocaleDateString()
                    : '-'}
                </td>
                <td>{tarefa.users.map((user) => user.name).join(', ')}</td>
                <td>{tarefa.projeto.designacao}</td>
                <td>
                  <div className="d-flex justify-content-center gap-4">
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
                        className="action-icon"
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
                      />
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`details-tooltip-${tarefa.id}`}>
                          Ver Detalhes
                        </Tooltip>
                      }
                    >
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        onClick={() => onViewDetails(tarefa.id)}
                        className="action-icon"
                      />
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">
                Não existem tarefas
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {totalPages > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx}
                active={idx === page}
                onClick={() => onPageChange(idx)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};
export default TarefaTable;
