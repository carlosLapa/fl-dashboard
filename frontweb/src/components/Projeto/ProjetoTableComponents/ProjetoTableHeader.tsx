import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';

interface ProjetoTableHeaderProps {
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const ProjetoTableHeader: React.FC<ProjetoTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  // Helper function for sortable headers
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
    <thead>
      <tr>
        {renderSortableHeader('projetoAno', 'Ano')}
        {renderSortableHeader('designacao', 'Designação')}
        {renderSortableHeader('cliente.name', 'Cliente')}
        {renderSortableHeader('tipo', 'Tipo')}
        {renderSortableHeader('prioridade', 'Prioridade')}
        {renderSortableHeader('coordenador.name', 'Coordenador')}
        {renderSortableHeader('dataProposta', 'Data Proposta')}
        {renderSortableHeader('dataAdjudicacao', 'Data Adjudicação')}
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
  );
};

export default ProjetoTableHeader;
