import React, { useState, useRef, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faSort,
  faSortDown,
  faSortUp,
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
  faKeyboard,
} from '@fortawesome/free-solid-svg-icons';
import {
  OverlayTrigger,
  Tooltip,
  Pagination,
  Form,
  Button,
  Row,
  Col,
  Card,
  Collapse,
  Spinner,
  Badge,
} from 'react-bootstrap';
import './styles.scss';
import { getProjetosAPI } from 'api/requestsApi';
import { Projeto } from 'types/projeto';

interface TarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  // Date filter props
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyDateFilter: () => void;
  onClearDateFilter: () => void;
  dateFilterField: string;
  onDateFilterFieldChange: (field: string) => void;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
  // New enhanced filter props
  descricaoFilter?: string;
  statusFilter?: string;
  projetoFilter?: string;
  onDescricaoFilterChange?: (value: string) => void;
  onStatusFilterChange?: (value: string) => void;
  onProjetoFilterChange?: (value: string) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
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
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyDateFilter,
  onClearDateFilter,
  dateFilterField,
  onDateFilterFieldChange,
  sortField,
  sortDirection,
  onSort,
  // New enhanced filter props
  descricaoFilter,
  statusFilter,
  projetoFilter,
  onDescricaoFilterChange,
  onStatusFilterChange,
  onProjetoFilterChange,
  onApplyFilters,
  onClearFilters,
  showFilters,
  onToggleFilters,
}) => {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLButtonElement>(null);
  const actualShowFilters = showFilters ?? false;
  const setShowFilters = onToggleFilters ?? (() => {});
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<Projeto[]>([]);
  const [showProjetoDropdown, setShowProjetoDropdown] = useState(false);
  const [localProjetoFilter, setLocalProjetoFilter] = useState(
    projetoFilter || ''
  );

  // Fetch all projetos when the component mounts
  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        console.log('TarefaTable - Fetching projetos...');
        const response = await getProjetosAPI(0, 1000);
        console.log('TarefaTable - Fetched projetos:', response.content);
        setProjetos(response.content);
      } catch (error) {
        console.error('TarefaTable - Error fetching projetos:', error);
      }
    };
    fetchProjetos();
  }, []);

  // Filter projetos based on user input
  useEffect(() => {
    if (localProjetoFilter) {
      const filtered = projetos.filter((projeto) =>
        projeto.designacao
          .toLowerCase()
          .includes(localProjetoFilter.toLowerCase())
      );
      setFilteredProjetos(filtered);
      setShowProjetoDropdown(filtered.length > 0);
    } else {
      setFilteredProjetos([]);
      setShowProjetoDropdown(false);
    }
  }, [localProjetoFilter, projetos]);

  useEffect(() => {
    console.log('TarefaTable - projetoFilter prop changed:', projetoFilter);

    if (!projetoFilter) {
      // Filter is cleared
      console.log('TarefaTable - clearing localProjetoFilter');
      setLocalProjetoFilter('');
    } else if (projetos.length > 0) {
      // Find project by ID and set the name if we don't already have it
      const projeto = projetos.find((p) => p.id.toString() === projetoFilter);
      if (projeto && localProjetoFilter !== projeto.designacao) {
        console.log('TarefaTable - Setting project name:', projeto.designacao);
        setLocalProjetoFilter(projeto.designacao);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projetoFilter, projetos]);

  // Set focus to first input when filters are shown
  useEffect(() => {
    if (actualShowFilters && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100); // Small delay to ensure the collapse animation has started
    }
  }, [actualShowFilters]);

  // Handler functions
  const handleDescricaoChange = useCallback(
    (value: string) => {
      console.log('TarefaTable - Descricao filter changed to:', value);
      onDescricaoFilterChange?.(value);
    },
    [onDescricaoFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      console.log('TarefaTable - Status filter changed to:', value);
      onStatusFilterChange?.(value);
    },
    [onStatusFilterChange]
  );

  const handleProjetoInputChange = useCallback(
    (value: string) => {
      console.log('TarefaTable - Projeto input changed to:', value);
      setLocalProjetoFilter(value);
      // Only update the parent's state when the user clears the input
      if (value === '') {
        console.log('TarefaTable - Clearing projeto filter in parent');
        onProjetoFilterChange?.('');
      }
    },
    [onProjetoFilterChange]
  );

  const handleApplyFiltersClick = useCallback(() => {
    console.log('TarefaTable - Apply filters clicked');
    onApplyFilters?.();
  }, [onApplyFilters]);

  const handleClearFiltersClick = useCallback(() => {
    console.log('TarefaTable - Clear filters clicked');
    onClearFilters?.();
  }, [onClearFilters]);

  const handleSelectProjeto = useCallback(
    (projeto: Projeto) => {
      console.log('TarefaTable - Selected projeto:', projeto);
      setLocalProjetoFilter(projeto.designacao);
      onProjetoFilterChange?.(projeto.id.toString());
      setShowProjetoDropdown(false);
    },
    [onProjetoFilterChange]
  );

  const handleTabKey = (e: React.KeyboardEvent) => {
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
  };

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

  // Add global keyboard event listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!actualShowFilters);
      }

      // Escape key to clear filters - works globally when filter card is visible
      if (e.key === 'Escape' && actualShowFilters) {
        e.preventDefault();
        handleClearFiltersClick();
      }

      // Enter key to apply filters when filter card is visible and not in an input
      if (
        e.key === 'Enter' &&
        actualShowFilters &&
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualShowFilters, handleClearFiltersClick, handleApplyFiltersClick]);

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

  return (
    <div className="tarefa-container">
      {/* Enhanced Filter Section */}
      <Card className="mb-4">
        <Card.Header
          className="d-flex justify-content-between align-items-center"
          onClick={() => setShowFilters(!actualShowFilters)}
          style={{ cursor: 'pointer' }}
          aria-expanded={actualShowFilters}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowFilters(!actualShowFilters);
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
          <FontAwesomeIcon
            icon={actualShowFilters ? faChevronUp : faChevronDown}
          />
        </Card.Header>
        <Collapse in={actualShowFilters}>
          <div>
            <Card.Body>
              <Row className="g-3">
                {/* Text Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Descrição</Form.Label>
                    <Form.Control
                      ref={firstInputRef}
                      type="text"
                      placeholder="Filtrar por descrição"
                      value={descricaoFilter || ''}
                      onChange={(e) => handleDescricaoChange(e.target.value)}
                      onKeyDown={(e) => {
                        handleFilterKeyDown(e);
                        handleTabKey(e);
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Projeto</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Filtrar por projeto"
                        value={localProjetoFilter}
                        onChange={(e) =>
                          handleProjetoInputChange(e.target.value)
                        }
                        onFocus={() => {
                          if (filteredProjetos.length > 0) {
                            setShowProjetoDropdown(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding the dropdown to allow for clicks
                          setTimeout(() => setShowProjetoDropdown(false), 200);
                        }}
                        onKeyDown={handleFilterKeyDown}
                      />
                      {showProjetoDropdown && (
                        <div
                          className="position-absolute w-100 bg-white border rounded shadow-sm"
                          style={{
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }}
                        >
                          {filteredProjetos.map((projeto) => (
                            <div
                              key={projeto.id}
                              className="p-2 border-bottom"
                              style={{ cursor: 'pointer' }}
                              onMouseDown={() => handleSelectProjeto(projeto)}
                            >
                              {projeto.designacao}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                {/* Status Filter */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={statusFilter || ''}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      onKeyDown={handleFilterKeyDown}
                    >
                      <option value="">Todos</option>
                      <option value="BACKLOG">Backlog</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                {/* Date Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Campo de Data</Form.Label>
                    <Form.Select
                      value={dateFilterField}
                      onChange={(e) => onDateFilterFieldChange(e.target.value)}
                    >
                      <option value="prazoEstimado">Início</option>
                      <option value="prazoReal">Prazo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
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
              </Row>
              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={handleClearFiltersClick}
                  className="clear-filters-btn"
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
                      ? new Date(tarefa.prazoEstimado).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="prazo-column">
                    {tarefa.prazoReal
                      ? new Date(tarefa.prazoReal).toLocaleDateString()
                      : '-'}
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
