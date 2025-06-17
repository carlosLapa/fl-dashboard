import React, { useState, useEffect, useCallback } from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import { ProjetoFilterState } from '../../types/filters';
import { Pagination, Table, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import ProjetoFilterPanel from './ProjetoFilterPanel';
import './ProjetoTable.scss';

interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  filters: ProjetoFilterState;
  updateFilter: (name: keyof ProjetoFilterState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
  onDeleteProjeto,
  page,
  onPageChange,
  totalPages,
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  isLoading,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderUserNames = (users: User[]) => {
    return users.map((user) => user.name).join(', ');
  };

  // Handle apply filters button click
  const handleApplyFiltersClick = useCallback(() => {
    console.log('ProjetoTable - Apply filters clicked');
    onApplyFilters();
  }, [onApplyFilters]);

  // Handle clear filters button click
  const handleClearFiltersClick = useCallback(() => {
    console.log('ProjetoTable - Clear filters clicked');
    onClearFilters();
  }, [onClearFilters]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showFilters]);

  // Add this helper function for sortable headers
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
          <span className="visually-hidden">Carregando projetos...</span>
        </Spinner>
        <p className="mt-2">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="projeto-container">
      {/* Use the new ProjetoFilterPanel component */}
      <ProjetoFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={handleApplyFiltersClick}
        onClearFilters={handleClearFiltersClick}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Table Section */}
      <div className="table-responsive">
        {projetos.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                {renderSortableHeader('projetoAno', 'Ano')}
                {renderSortableHeader('designacao', 'Designação')}
                {renderSortableHeader('entidade', 'Entidade')}
                {renderSortableHeader('prioridade', 'Prioridade')}
                {renderSortableHeader(
                  'observacao',
                  'Observação',
                  'd-none d-md-table-cell'
                )}
                {renderSortableHeader('prazo', 'Prazo')}
                <th className="d-none d-lg-table-cell">Colaboradores</th>
                {renderSortableHeader('status', 'Status')}
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
                  <td className="d-none d-md-table-cell">
                    {projeto.observacao}
                  </td>
                  <td>{formatDate(projeto.prazo)}</td>
                  <td className="d-none d-lg-table-cell">
                    {renderUserNames(projeto.users)}
                  </td>
                  <td>
                    <ProjetoStatusBadge status={projeto.status} />
                  </td>
                  <td>
                    <div className="action-icons">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-edit-${projeto.id}`}>
                            Editar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditProjeto(projeto.id)}
                          className="mr-2 edit-icon"
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-delete-${projeto.id}`}>
                            Apagar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteProjeto(projeto.id)}
                          className="delete-icon"
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-kanban-${projeto.id}`}>
                            Ver Kanban Board
                          </Tooltip>
                        }
                      >
                        <Link
                          to={`/projetos/${projeto.id}/full`}
                          className="view-icon"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-details-${projeto.id}`}>
                            Ver Detalhes do Projeto
                          </Tooltip>
                        }
                      >
                        <Link
                          to={`/projetos/${projeto.id}/details`}
                          className="info-icon"
                          style={{ marginLeft: '2px' }}
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </Link>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center p-4">
            <p>Não foram encontrados projetos.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
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

export default ProjetoTable;
