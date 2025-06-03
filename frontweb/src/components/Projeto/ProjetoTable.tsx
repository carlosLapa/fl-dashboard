import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import {
  Pagination,
  Table,
  Form,
  Button,
  Row,
  Col,
  Card,
  Collapse,
  Spinner,
  Badge,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
  faKeyboard,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import './ProjetoTable.scss';

interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  // Date filter props
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  // Text filter props
  designacaoFilter: string;
  entidadeFilter: string;
  prioridadeFilter: string;
  onDesignacaoFilterChange: (value: string) => void;
  onEntidadeFilterChange: (value: string) => void;
  onPrioridadeFilterChange: (value: string) => void;
  // Filter actions
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
  onDeleteProjeto,
  page,
  onPageChange,
  totalPages,
  statusFilter,
  onStatusFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  designacaoFilter,
  entidadeFilter,
  prioridadeFilter,
  onDesignacaoFilterChange,
  onEntidadeFilterChange,
  onPrioridadeFilterChange,
  onApplyFilters,
  onClearFilters,
  isLoading,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLButtonElement>(null);
  const filterCardRef = useRef<HTMLDivElement>(null);

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

  // Set focus to first input when filters are shown
  useEffect(() => {
    if (showFilters && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100); // Small delay to ensure the collapse animation has started
    }
  }, [showFilters]);

  // Handle clear filters button click
  const handleClearFiltersClick = useCallback(() => {
    console.log('ProjetoTable - Clear filters clicked');
    onClearFilters();
  }, [onClearFilters]);

  // Handle apply filters button click
  const handleApplyFiltersClick = useCallback(() => {
    console.log(
      'ProjetoTable - Apply filters clicked with prioridade:',
      prioridadeFilter
    );
    onApplyFilters();
  }, [onApplyFilters, prioridadeFilter]);

  const handlePrioridadeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      console.log('Priority changed to:', e.target.value);
      onPrioridadeFilterChange(e.target.value);
    },
    [onPrioridadeFilterChange]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }

      // Escape key to clear filters - works globally when filter card is visible
      if (e.key === 'Escape' && showFilters) {
        e.preventDefault();
        handleClearFiltersClick();
      }

      // Enter key to apply filters when filter card is visible and not in an input
      if (
        e.key === 'Enter' &&
        showFilters &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        handleApplyFiltersClick();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showFilters, handleClearFiltersClick, handleApplyFiltersClick]);

  // Tab key navigation for focus trap
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstInputRef.current) {
        e.preventDefault();
        lastInputRef.current?.focus();
      } else if (
        !e.shiftKey &&
        document.activeElement === lastInputRef.current
      ) {
        e.preventDefault();
        firstInputRef.current?.focus();
      }
    }
  }, []);

  // Keyboard shortcuts for filter actions
  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Apply filters on Enter key
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        handleApplyFiltersClick();
      }
      // Clear filters on Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClearFiltersClick();
      }
    },
    [handleApplyFiltersClick, handleClearFiltersClick]
  );

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
      {/* Enhanced Filter Section */}
      <Card className="mb-4" ref={filterCardRef}>
        <Card.Header
          className="d-flex justify-content-between align-items-center"
          onClick={() => setShowFilters(!showFilters)}
          style={{ cursor: 'pointer' }}
          aria-expanded={showFilters}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowFilters(!showFilters);
            }
          }}
        >
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filtros Avançados
            <Badge bg="light" text="dark" className="ms-2">
              <FontAwesomeIcon icon={faKeyboard} className="me-1" size="xs" />
              Alt+F
            </Badge>
          </h5>
          <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
        </Card.Header>
        <Collapse in={showFilters}>
          <div>
            <Card.Body>
              <Row className="g-3">
                {/* Text Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Designação</Form.Label>
                    <Form.Control
                      ref={firstInputRef}
                      type="text"
                      placeholder="Filtrar por designação"
                      value={designacaoFilter}
                      onChange={(e) => onDesignacaoFilterChange(e.target.value)}
                      onKeyDown={(e) => {
                        handleFilterKeyDown(e);
                        handleTabKey(e);
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Entidade</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filtrar por entidade"
                      value={entidadeFilter}
                      onChange={(e) => onEntidadeFilterChange(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Prioridade</Form.Label>
                    <Form.Select
                      value={prioridadeFilter}
                      onChange={handlePrioridadeChange}
                      onKeyDown={handleFilterKeyDown}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                {/* Date Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Data Inicial</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => onStartDateChange(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Data Final</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => onEndDateChange(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    />
                  </Form.Group>
                </Col>
                {/* Status Filter */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    >
                      <option value="ALL">Todos</option>
                      <option value="ATIVO">Ativo</option>
                      <option value="EM_PROGRESSO">Em Progresso</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="SUSPENSO">Suspenso</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={handleClearFiltersClick}
                  className="clear-filters-btn"
                  onKeyDown={handleFilterKeyDown}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Limpar Filtros
                  <small className="ms-1 text-muted">(Esc)</small>
                </Button>
                <Button
                  ref={lastInputRef}
                  variant="primary"
                  onClick={handleApplyFiltersClick}
                  className="apply-filters-btn"
                  onKeyDown={(e) => {
                    handleFilterKeyDown(e);
                    handleTabKey(e);
                  }}
                >
                  Aplicar Filtros
                  <small className="ms-1 text-muted">(Enter)</small>
                </Button>
              </div>
            </Card.Body>
          </div>
        </Collapse>
      </Card>

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
