import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';

interface TarefaTableHeaderProps {
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const TarefaTableHeader: React.FC<TarefaTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
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
    <thead>
      <tr>
        {renderSortableHeader('descricao', 'Descrição')}
        {renderSortableHeader('status', 'Estado')}
        {renderSortableHeader('prazoEstimado', 'Início', 'prazo-column')}
        {renderSortableHeader('prazoReal', 'Prazo', 'prazo-column')}
        {renderSortableHeader('workingDays', 'Dias Úteis', 'prazo-column')}
        <th>Atribuição</th>
        <th>Externos</th>
        {renderSortableHeader('projeto.designacao', 'Projeto')}
        <th>Ações</th>
      </tr>
    </thead>
  );
};

export default TarefaTableHeader;
