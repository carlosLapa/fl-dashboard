import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { Spinner } from 'react-bootstrap';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { UserTarefaFilterState } from '../../types/filters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import TarefaPrioridadeBadge from '../Tarefa/TarefaPrioridadeBadge';
import UserTarefaFilterPanel from './UserTarefaFilterPanel';
import TarefaPagination from '../Tarefa/TarefaTableComponents/TarefaPagination';
import { getTarefaStatusLabel } from '../../constants/tarefaStatus';
import './userTarefaTable.scss';

interface UserTarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: UserTarefaFilterState;
  updateFilter: (name: keyof UserTarefaFilterState, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isFiltered?: boolean;
}

const UserTarefaTable: React.FC<UserTarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  isFiltered = false,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="tarefa-table-container">
      <UserTarefaFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      {isLoading ? (
        <div className="text-center p-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">A carregar...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover className="tarefa-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th className="d-none d-md-table-cell">Estado</th>
                  <th className="d-none d-md-table-cell">Prioridade</th>
                  <th className="d-none d-md-table-cell">Ínicio</th>
                  <th className="d-none d-lg-table-cell">Prazo</th>
                  <th className="d-none d-lg-table-cell">Dias Úteis</th>
                  <th className="d-none d-lg-table-cell">Projeto</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tarefas.length > 0 ? (
                  tarefas.map((tarefa) => (
                    <tr key={tarefa.id}>
                      <td>{tarefa.descricao}</td>
                      <td className="d-none d-md-table-cell">
                        {getTarefaStatusLabel(tarefa.status)}
                      </td>
                      <td className="d-none d-md-table-cell">
                        <TarefaPrioridadeBadge
                          prioridade={tarefa.prioridade}
                        />
                      </td>
                      <td className="d-none d-md-table-cell">
                        {new Date(tarefa.prazoEstimado).toLocaleDateString()}
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {new Date(tarefa.prazoReal).toLocaleDateString()}
                      </td>
                      <td className="d-none d-lg-table-cell">
                        {tarefa.workingDays != null
                          ? `${tarefa.workingDays} dia(s)`
                          : '-'}
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
                    <td colSpan={8} className="text-center">
                      {isFiltered
                        ? 'Nenhuma tarefa corresponde aos filtros aplicados'
                        : 'Não existem tarefas para este utilizador'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <TarefaPagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default UserTarefaTable;
