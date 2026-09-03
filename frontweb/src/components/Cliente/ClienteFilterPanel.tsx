import React from 'react';
import { ClienteFilterState } from '../../types/filters';
import { Form, Col } from 'react-bootstrap';
import BaseFilterPanel from '../common/BaseFilterPanel';

interface ClienteFilterPanelProps {
  filters: ClienteFilterState;
  updateFilter: (name: keyof ClienteFilterState, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const ClienteFilterPanel: React.FC<ClienteFilterPanelProps> = ({
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  showFilters,
  setShowFilters,
}) => {
  return (
    <BaseFilterPanel
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
    >
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por nome"
            value={filters.name || ''}
            onChange={(e) => updateFilter('name', e.target.value)}
            maxLength={255}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>NIF</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por NIF"
            value={filters.nif || ''}
            onChange={(e) => updateFilter('nif', e.target.value)}
            maxLength={9}
          />
        </Form.Group>
      </Col>
      <Col md={6} lg={4}>
        <Form.Group>
          <Form.Label>Morada</Form.Label>
          <Form.Control
            type="text"
            placeholder="Filtrar por morada"
            value={filters.morada || ''}
            onChange={(e) => updateFilter('morada', e.target.value)}
            maxLength={255}
          />
        </Form.Group>
      </Col>
    </BaseFilterPanel>
  );
};

export default ClienteFilterPanel;
