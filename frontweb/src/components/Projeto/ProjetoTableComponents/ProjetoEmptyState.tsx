import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface ProjetoEmptyStateProps {
  isFiltered: boolean;
  onClearFilters?: () => void;
}

const ProjetoEmptyState: React.FC<ProjetoEmptyStateProps> = ({
  isFiltered,
  onClearFilters,
}) => {
  return (
    <div className="text-center p-4">
      <FontAwesomeIcon icon={faSearch} size="3x" className="text-muted mb-3" />
      <p className="mb-2">
        {isFiltered
          ? 'Não foram encontrados projetos com os filtros aplicados.'
          : 'Não foram encontrados projetos.'}
      </p>
      {isFiltered && onClearFilters && (
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClearFilters}
        >
          Limpar Filtros
        </button>
      )}
    </div>
  );
};

export default ProjetoEmptyState;
