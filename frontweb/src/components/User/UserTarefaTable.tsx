import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import { Spinner } from 'react-bootstrap';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { UserTarefaFilterState } from '../../types/filters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faEye,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
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
  onViewDetails: (tarefaId: number) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: UserTarefaFilterState;
  updateFilter: (name: keyof UserTarefaFilterState, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isFiltered?: boolean;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const UserTarefaTable: React.FC<UserTarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
  onViewDetails,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  isFiltered = false,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const renderSortableHeader = (
    field: string,
    label: string,
    className?: string
  ) => (
    <th
      className={className || ''}
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer' }}
    >
      <div className="d-flex align-items-center justify-content-between">
        <span>{label}</span>
        <span className="ms-1">
          {sortField === field ? (
            <FontAwesomeIcon
              icon={sortDirection === 'ASC' ? faSortUp : faSortDown}
              size="sm"
            />
          ) : (
            <FontAwesomeIcon icon={faSort} size="sm" opacity={0.3} />
          )}
        </span>
      </div>
    </th>
  );

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
                  {renderSortableHeader('descricao', 'Descrição')}
                  {renderSortableHeader(
                    'status',
                    'Estado',
                    'd-none d-md-table-cell'
                  )}
                  {renderSortableHeader(
                    'prioridade',
                    'Prioridade',
                    'd-none d-md-table-cell'
                  )}
                  {renderSortableHeader(
                    'prazoEstimado',
                    'Ínicio',
                    'd-none d-md-table-cell'
                  )}
                  {renderSortableHeader(
                    'prazoReal',
                    'Prazo',
                    'd-none d-lg-table-cell'
                  )}
                  {renderSortableHeader(
                    'workingDays',
                    'Duração (dias úteis)',
                    'd-none d-lg-table-cell'
                  )}
                  {renderSortableHeader(
                    'projeto.designacao',
                    'Projeto',
                    'd-none d-lg-table-cell'
                  )}
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
                        {tarefa.projeto?.id ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`projeto-link-tooltip-${tarefa.id}`}>
                                Abrir Kanban do projeto
                              </Tooltip>
                            }
                          >
                            <Link
                              to={`/projetos/${tarefa.projeto.id}/full`}
                              className="projeto-kanban-link"
                            >
                              {tarefa.projeto.designacao}
                            </Link>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted">Sem projeto</span>
                        )}
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
                              className="action-icon view-details-icon"
                              style={{ marginLeft: '10px' }}
                            />
                          </OverlayTrigger>
                          {tarefa.projeto?.id && (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id={`kanban-tooltip-${tarefa.id}`}>
                                  Ver Kanban do Projeto
                                </Tooltip>
                              }
                            >
                              <Link
                                to={`/projetos/${tarefa.projeto.id}/full`}
                                className="action-icon kanban-icon"
                                style={{ marginLeft: '10px' }}
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Link>
                            </OverlayTrigger>
                          )}
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
