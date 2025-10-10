import React, { useState, useEffect } from 'react';
import { Projeto } from '../../types/projeto';
import { ProjetoFilterState } from '../../types/filters';
import { Table } from 'react-bootstrap';
import ProjetoFilterPanel from './ProjetoFilterPanel';
import {
  ProjetoTableHeader,
  ProjetoTableRow,
  ProjetoPagination,
  ProjetoEmptyState,
  ProjetoLoadingState,
} from './ProjetoTableComponents';
import './ProjetoTable.scss';
import { hasActiveFilters } from './utils/filterUtils';

interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  filters: ProjetoFilterState;
  updateFilter: (name: keyof ProjetoFilterState, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos = [], // Definir valor padrão como array vazio
  onEditProjeto,
  onDeleteProjeto,
  page,
  onPageChange,
  totalPages,
  filters,
  updateFilter,
  onApplyFilters,
  onClearFilters,
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Garantir que projetos seja sempre um array válido
  const projetosToRender = Array.isArray(projetos) ? projetos : [];

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+F to toggle filters
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        setShowFilters(!showFilters);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showFilters]);

  if (isLoading) {
    return <ProjetoLoadingState />;
  }

  return (
    <div className="projeto-container">
      {/* Filter Panel */}
      <ProjetoFilterPanel
        filters={filters}
        updateFilter={updateFilter}
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Table Section */}
      <div className="table-responsive">
        {projetosToRender.length > 0 ? (
          <Table striped bordered hover>
            <ProjetoTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <tbody>
              {projetosToRender.map((projeto) => (
                <ProjetoTableRow
                  key={projeto.id}
                  projeto={projeto}
                  onEditProjeto={onEditProjeto}
                  onDeleteProjeto={onDeleteProjeto}
                />
              ))}
            </tbody>
          </Table>
        ) : (
          <ProjetoEmptyState
            isFiltered={hasActiveFilters(filters)}
            onClearFilters={onClearFilters}
          />
        )}
      </div>

      {/* Pagination */}
      <ProjetoPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ProjetoTable;
