import React from 'react';
import { Form, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
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

const PRIORIDADE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'Urgente', label: 'Urgente' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Média', label: 'Média' },
  { value: 'Baixa', label: 'Baixa' },
];

const RECORRENTE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
];

const FieldHelpIcon: React.FC<{ id: string; text: string }> = ({
  id,
  text,
}) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{text}</Tooltip>}>
    <FontAwesomeIcon
      icon={faInfoCircle}
      className="ms-1 text-muted"
      style={{ cursor: 'help' }}
    />
  </OverlayTrigger>
);

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
            maxLength={255}
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
          <Form.Label>Prioridade</Form.Label>
          <Form.Select
            value={filters.prioridade}
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

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Recorrente</Form.Label>
          <Form.Select
            value={filters.recorrente}
            onChange={(e) => updateFilter('recorrente', e.target.value)}
            onKeyDown={handleSelectKeyDown}
          >
            {RECORRENTE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>
            Prazo - Data Inicial
            <FieldHelpIcon
              id="tooltip-prazo-data-inicial"
              text="Mostra todas as tarefas cujo Prazo Real seja igual ou posterior a essa data (sem limite superior)"
            />
          </Form.Label>
          <Form.Control
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>
            Prazo - Data Final
            <FieldHelpIcon
              id="tooltip-prazo-data-final"
              text="Mostra todas as tarefas cujo Prazo Real seja igual ou anterior a essa data (sem limite inferior; o próprio dia da data final fica incluído)"
            />
          </Form.Label>
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
