import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';

interface ClienteTableHeaderProps {
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const ClienteTableHeader: React.FC<ClienteTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return faSort;
    }
    return sortDirection === 'asc' ? faSortUp : faSortDown;
  };

  const renderSortableHeader = (field: string, label: string) => (
    <th
      onClick={() => onSort(field)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      className="sortable-header"
    >
      {label}{' '}
      <FontAwesomeIcon
        icon={getSortIcon(field)}
        className={sortField === field ? 'text-primary' : 'text-muted'}
        size="sm"
      />
    </th>
  );

  return (
    <tr>
      <th style={{ width: '40px' }}></th>
      {renderSortableHeader('numero', 'Número')}
      {renderSortableHeader('name', 'Nome')}
      {renderSortableHeader('morada', 'Morada')}
      <th>NIF</th>
      <th>Contacto</th>
      {renderSortableHeader('responsavel', 'Responsável')}
      <th>Ações</th>
    </tr>
  );
};

export default ClienteTableHeader;
