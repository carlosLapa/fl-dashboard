import React, { useEffect, useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import { TarefaFilterState } from '../../types/filters';
import BaseFilterPanel from '../common/BaseFilterPanel';
import { getProjetosAPI } from 'api/requestsApi';
import { Projeto } from 'types/projeto';

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
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<Projeto[]>([]);
  const [showProjetoDropdown, setShowProjetoDropdown] = useState(false);
  const [projetoSearchText, setProjetoSearchText] = useState('');

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await getProjetosAPI(0, 1000);
        setProjetos(response.content);
      } catch (error) {
        console.error('Error fetching projetos:', error);
      }
    };
    fetchProjetos();
  }, []);

  useEffect(() => {
    if (filters.projetoId && projetos.length > 0) {
      const projeto = projetos.find(
        (p) => p.id.toString() === filters.projetoId
      );
      if (projeto) {
        setProjetoSearchText(projeto.designacao);
      }
    }
  }, [filters.projetoId, projetos]);

  useEffect(() => {
    if (projetoSearchText) {
      const filtered = projetos.filter((projeto) =>
        projeto.designacao
          .toLowerCase()
          .includes(projetoSearchText.toLowerCase())
      );
      setFilteredProjetos(filtered);
      setShowProjetoDropdown(filtered.length > 0);
    } else {
      setFilteredProjetos([]);
      setShowProjetoDropdown(false);
    }
  }, [projetoSearchText, projetos]);

  const handleProjetoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProjetoSearchText(value);
    if (value === '') {
      updateFilter('projetoId', '');
    }
  };

  const handleSelectProjeto = (projeto: Projeto) => {
    setProjetoSearchText(projeto.designacao);
    updateFilter('projetoId', projeto.id.toString());
    setShowProjetoDropdown(false);
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
      onClearFilters={() => {
        onClearFilters();
        setProjetoSearchText('');
      }}
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
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder="Filtrar por projeto"
              value={projetoSearchText}
              onChange={handleProjetoInputChange}
              onFocus={() => {
                if (filteredProjetos.length > 0) {
                  setShowProjetoDropdown(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowProjetoDropdown(false), 200);
              }}
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
