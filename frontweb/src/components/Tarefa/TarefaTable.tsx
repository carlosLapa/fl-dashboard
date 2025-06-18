import React from 'react';
import { Table } from 'react-bootstrap';
import { TarefaWithUserAndProjetoDTO, TarefaStatus } from '../../types/tarefa';
import { TarefaFilterState } from '../../types/filters';
import './styles.scss';

import {
  TarefaTableHeader,
  TarefaTableRow,
  TarefaPagination,
  TarefaEmptyState,
  TarefaLoadingState,
} from './TarefaTableComponents';

// Import the TarefaFilterPanel
import TarefaFilterPanel from './TarefaFilterPanel';

interface TarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;

  // Filter state props
  filters: TarefaFilterState;
  updateFilter: (name: keyof TarefaFilterState, value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;

  // Sorting props
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;

  // Status update prop - now optional
  onStatusChange?: (tarefaId: number, newStatus: TarefaStatus) => void;

  // UI state props
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
  onViewDetails,
  page,
  totalPages,
  onPageChange,
  isLoading,

  // Filter state props
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,

  // Sorting props
  sortField,
  sortDirection,
  onSort,

  // Status update prop
  onStatusChange,

  // UI state props
  showFilters = false,
  onToggleFilters,
}) => {
  // If onToggleFilters is not provided, create a no-op function
  const setShowFilters = onToggleFilters || (() => {});

  if (isLoading) {
    return <TarefaLoadingState />;
  }

  const hasTarefas = Array.isArray(tarefas) && tarefas.length > 0;

  return (
    <div className="tarefa-container">
      {/* Include the TarefaFilterPanel */}
      <TarefaFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      <div className="table-responsive">
        <Table striped bordered hover>
          <TarefaTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <tbody>
            {hasTarefas ? (
              tarefas.map((tarefa) => (
                <TarefaTableRow
                  key={tarefa.id}
                  tarefa={tarefa}
                  onEditTarefa={onEditTarefa}
                  onDeleteTarefa={onDeleteTarefa}
                  onViewDetails={onViewDetails}
                  onStatusChange={onStatusChange}
                />
              ))
            ) : (
              <TarefaEmptyState />
            )}
          </tbody>
        </Table>
      </div>

      <TarefaPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default TarefaTable;
