import React from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaStatus, TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { TarefaFilterState } from '../../types/filters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip, Pagination, Spinner } from 'react-bootstrap';
import './styles.scss';
import { formatDate } from '../../utils/dateUtils';
import TarefaFilterPanel from './TarefaFilterPanel';

interface TarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;

  // Filter state props
  filters: TarefaFilterState;
  updateFilter: (name: keyof TarefaFilterState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;

  // Sorting props
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;

  // Status update prop
  onStatusChange?: (tarefaId: number, newStatus: TarefaStatus) => Promise<void>;

  // UI state props
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
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

  // Filter state props
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,

  // Sorting props
  sortField,
  sortDirection,
  onSort,

  // Status update prop
  onStatusChange,

  // UI state props
  showFilters,
  onToggleFilters,
}) => {
  // Helper function to render sortable column headers
  const renderSortableHeader = (
    field: string,
    label: string,
    className?: string
  ) => {
    return (
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
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando tarefas...</span>
        </Spinner>
        <p className="mt-2">Carregando tarefas...</p>
      </div>
    );
  }

  const hasTarefas = Array.isArray(tarefas) && tarefas.length > 0;

  return (
    <div className="tarefa-container">
      {/* Use the new TarefaFilterPanel component */}
      <TarefaFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        showFilters={showFilters || false}
        setShowFilters={onToggleFilters || (() => {})}
      />

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {renderSortableHeader('descricao', 'Descrição')}
              {renderSortableHeader('status', 'Estado')}
              {renderSortableHeader('prazoEstimado', 'Início', 'prazo-column')}
              {renderSortableHeader('prazoReal', 'Prazo', 'prazo-column')}
              {renderSortableHeader(
                'workingDays',
                'Dias Úteis',
                'prazo-column'
              )}
              <th>Atribuição</th>
              <th>Externos</th>
              {renderSortableHeader('projeto.designacao', 'Projeto')}
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
                      ? formatDate(tarefa.prazoEstimado)
                      : '-'}
                  </td>
                  <td className="prazo-column">
                    {tarefa.prazoReal ? formatDate(tarefa.prazoReal) : '-'}
                  </td>
                  <td className="prazo-column">
                    {tarefa.workingDays !== undefined
                      ? `${tarefa.workingDays} dia(s)`
                      : '-'}
                  </td>
                  <td>
                    {tarefa.users && tarefa.users.length > 0
                      ? tarefa.users.map((user) => user.name).join(', ')
                      : '-'}
                  </td>
                  <td>
                    {/* Display externos if they exist */}
                    {tarefa.externos && tarefa.externos.length > 0
                      ? tarefa.externos
                          .map((externo) => externo.name)
                          .join(', ')
                      : '-'}
                  </td>
                  <td>{tarefa.projeto.designacao}</td>
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
                          style={{ marginRight: '8px' }}
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
                          style={{ marginRight: '8px' }}
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
                        />
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center">
                  Não existem tarefas
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination className="flex-wrap">
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
