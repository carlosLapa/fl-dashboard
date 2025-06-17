import React, { useRef, useCallback, useEffect } from 'react';
import { ProjetoFilterState } from '../../types/filters';
import { Form, Button, Row, Col, Card, Collapse, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
  faKeyboard,
} from '@fortawesome/free-solid-svg-icons';

interface ProjetoFilterPanelProps {
  filters: ProjetoFilterState;
  updateFilter: (name: keyof ProjetoFilterState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const PRIORITY_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

const ProjetoFilterPanel: React.FC<ProjetoFilterPanelProps> = ({
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  showFilters,
  setShowFilters,
}) => {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLButtonElement>(null);
  const filterCardRef = useRef<HTMLDivElement>(null);

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    // Skip empty values and 'ALL' status
    return value && value !== '' && (key !== 'status' || value !== 'ALL');
  }).length;

  // Set focus to first input when filters are shown
  useEffect(() => {
    if (showFilters && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100); // Small delay to ensure the collapse animation has started
    }
  }, [showFilters]);

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
        onApplyFilters();
      }
      // Clear filters on Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onClearFilters();
      }
    },
    [onApplyFilters, onClearFilters]
  );

  return (
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
          {/* Show active filters count badge if there are active filters */}
          {activeFiltersCount > 0 && (
            <Badge bg="primary" className="ms-2" pill>
              {activeFiltersCount}
            </Badge>
          )}
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
                    value={filters.designacao}
                    onChange={(e) => updateFilter('designacao', e.target.value)}
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
                    value={filters.entidade}
                    onChange={(e) => updateFilter('entidade', e.target.value)}
                    onKeyDown={handleFilterKeyDown}
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Prioridade</Form.Label>
                  <Form.Select
                    value={filters.prioridade}
                    onChange={(e) => updateFilter('prioridade', e.target.value)}
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
                    value={filters.startDate}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    onKeyDown={handleFilterKeyDown}
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Data Final</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    onKeyDown={handleFilterKeyDown}
                  />
                </Form.Group>
              </Col>
              {/* Status Filter */}
              <Col md={6} lg={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
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
                onClick={onClearFilters}
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
                onClick={onApplyFilters}
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
  );
};

export default ProjetoFilterPanel;
