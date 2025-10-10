import React from 'react';
import { Form, Col } from 'react-bootstrap';
import { TarefaFilterState } from '../../types/filters';
import BaseFilterPanel from '../common/BaseFilterPanel';
import ProjetoSelect from '../../components/ProjetoSelect';

interface TarefaFilterPanelProps {
  filters: TarefaFilterState;
  updateFilter: (name: keyof TarefaFilterState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
];

const DATE_FIELD_OPTIONS = [
  { value: 'prazoEstimado', label: 'Prazo Estimado' },
  { value: 'dataCriacao', label: 'Data de Criação' },
  { value: 'dataAtualizacao', label: 'Data de Atualização' },
];

const TarefaFilterPanel: React.FC<TarefaFilterPanelProps> = ({
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  showFilters,
  setShowFilters,
}) => {
  // Handle project selection using the ProjetoSelect component
  const handleProjetoChange = (projetoId: number | undefined, projetoName?: string) => {
    console.log('TarefaFilterPanel - Project selected:', projetoId, projetoName);
    updateFilter('projetoId', projetoId ? projetoId.toString() : '');
  };

  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onApplyFilters();
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    return value && value !== '' && key !== 'dateFilterField';
  }).length;

  return (
    <BaseFilterPanel
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      activeFiltersCount={activeFiltersCount}
      title="Filtros Avançados"
    >
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por descrição"
            value={filters.descricao}
            onChange={(e) => updateFilter('descricao', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Projeto</Form.Label>
          <ProjetoSelect
            selectedProjetoId={filters.projetoId ? Number(filters.projetoId) : undefined}
            onChange={handleProjetoChange}
            placeholder="Filtrar por projeto"
            className="mb-0"
          />
        </Form.Group>
      </Col>

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Estado</Form.Label>
          <Form.Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            onKeyDown={handleSelectKeyDown}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Campo de Data</Form.Label>
          <Form.Select
            value={filters.dateFilterField}
            onChange={(e) => updateFilter('dateFilterField', e.target.value)}
            onKeyDown={handleSelectKeyDown}
          >
            {DATE_FIELD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Data Inicial</Form.Label>
          <Form.Control
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
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
          />
        </Form.Group>
      </Col>
    </BaseFilterPanel>
  );
};

export default TarefaFilterPanel;
