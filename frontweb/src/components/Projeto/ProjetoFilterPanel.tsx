import React from 'react';
import { ProjetoFilterState } from '../../types/filters';
import { Form, Col } from 'react-bootstrap';
import BaseFilterPanel from '../common/BaseFilterPanel';
import ClienteSelect from '../ClienteSelect/ClienteSelect';

interface ProjetoFilterPanelProps {
  filters: ProjetoFilterState;
  updateFilter: (name: keyof ProjetoFilterState, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void; // Adicionando a prop obrigatória
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
  setShowFilters, // Inclua na desestruturação
}) => {
  // Handle Enter key in select elements
  const handleSelectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onApplyFilters();
    }

    // Call the parent handler if provided
    if (filterKeyDownHandler) {
      filterKeyDownHandler(e);
    }
  };

  return (
    <BaseFilterPanel
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      showFilters={showFilters}
      setShowFilters={setShowFilters} // Passe a prop para o BaseFilterPanel
    >
      {/* Text Filters */}
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Designação</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por designação"
            value={filters.designacao}
            onChange={(e) => updateFilter('designacao', e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Cliente</Form.Label>
          <ClienteSelect
            selectedClienteId={filters.clienteId}
            onChange={(clienteId, clienteName) => {
              console.log(
                `Cliente selecionado: ID=${clienteId}, Nome=${clienteName}`
              );

              // Atualizar os dois campos relevantes - garantindo que clienteId seja undefined quando não selecionado
              // e clienteName seja string vazia quando não selecionado
              updateFilter('clienteId', clienteId === undefined ? undefined : clienteId);
              updateFilter('cliente', clienteName || '');
              
              // Verificar os valores após a atualização
              console.log('ClienteId após update:', filters.clienteId, 'tipo:', typeof filters.clienteId);
              console.log('Cliente após update:', filters.cliente, 'tipo:', typeof filters.cliente);
            }}
            placeholder="Filtrar por cliente"
            isDisabled={false}
          />
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
      {/* Status Filter */}
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Estado</Form.Label>
          <Form.Select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            onKeyDown={handleSelectKeyDown}
          >
            <option value="ALL">Todos</option>
            <option value="ATIVO">Ativo</option>
            <option value="EM_PROGRESSO">Em Progresso</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="SUSPENSO">Suspenso</option>
          </Form.Select>
        </Form.Group>
      </Col>
      {/* Tipo Filter */}
      <Col md={6} lg={4}>
        <Form.Group controlId="filterTipo">
          <Form.Label>Tipo</Form.Label>
          <Form.Select
            name="tipo"
            value={filters.tipo || ''}
            onChange={(e) => updateFilter('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ASSESSORIA">Assessoria</option>
            <option value="CONSULTORIA">Consultoria</option>
            <option value="FISCALIZACAO">Fiscalização</option>
            <option value="LEVANTAMENTO">Levantamento</option>
            <option value="PROJETO">Projeto</option>
            <option value="REVISAO">Revisão</option>
            <option value="VISTORIA">Vistoria</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </BaseFilterPanel>
  );
};

function filterKeyDownHandler(e: React.KeyboardEvent<Element>) {
  // Prevent form submission on Enter in select elements, but allow navigation
  if (e.key === 'Enter') {
    e.preventDefault();
  }
  // You can add more custom key handling logic here if needed
}

export default ProjetoFilterPanel;
