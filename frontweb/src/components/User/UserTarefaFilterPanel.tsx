import React from 'react';
import { Form, Col } from 'react-bootstrap';
import { UserTarefaFilterState } from '../../types/filters';
import BaseFilterPanel from '../common/BaseFilterPanel';

interface UserTarefaFilterPanelProps {
  filters: UserTarefaFilterState;
  updateFilter: (name: keyof UserTarefaFilterState, value: any) => void;
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

const PRIORIDADE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'Urgente', label: 'Urgente' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Média', label: 'Média' },
  { value: 'Baixa', label: 'Baixa' },
];

const UserTarefaFilterPanel: React.FC<UserTarefaFilterPanelProps> = ({
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  showFilters,
  setShowFilters,
}) => {
  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onApplyFilters();
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([, value]) => {
    return value && value !== '';
  }).length;

  return (
    <BaseFilterPanel
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      activeFiltersCount={activeFiltersCount}
      title="Filtros"
    >
      <Col md={6} lg={3}>
        <Form.Group>
          <Form.Label>Descrição</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por descrição"
            value={filters.descricao || ''}
            onChange={(e) => updateFilter('descricao', e.target.value)}
          />
        </Form.Group>
      </Col>

      <Col md={6} lg={3}>
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={filters.status || ''}
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

      <Col md={6} lg={3}>
        <Form.Group>
          <Form.Label>Prioridade</Form.Label>
          <Form.Select
            value={filters.prioridade || ''}
            onChange={(e) => updateFilter('prioridade', e.target.value)}
            onKeyDown={handleSelectKeyDown}
          >
            {PRIORIDADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6} lg={3}>
        <Form.Group>
          <Form.Label>Projeto</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por projeto"
            value={filters.projeto || ''}
            onChange={(e) => updateFilter('projeto', e.target.value)}
          />
        </Form.Group>
      </Col>
    </BaseFilterPanel>
  );
};

export default UserTarefaFilterPanel;
