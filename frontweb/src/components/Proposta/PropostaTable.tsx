import React from 'react';
import { Proposta } from '../../types/proposta';
import { Table } from 'react-bootstrap';
import {
  PropostaTableHeader,
  PropostaTableRow,
  PropostaEmptyState,
  PropostaLoadingState,
} from './PropostaTableComponents';
import PropostaPagination from './PropostaTableComponents/PropostaPagination';

interface PropostaTableProps {
  propostas: Proposta[];
  onSelect: (proposta: Proposta) => void;
  onDeleteProposta?: (id: number) => void;
  onGenerateProjeto?: (proposta: Proposta) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  isLoading?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const PropostaTable: React.FC<PropostaTableProps> = ({
  propostas,
  onSelect,
  onDeleteProposta,
  onGenerateProjeto,
  page = 0,
  onPageChange = () => {},
  totalPages = 1,
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="proposta-container">
      <div className="table-responsive">
        <Table striped bordered hover>
          <PropostaTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          />
          <tbody>
            {isLoading ? (
              <PropostaLoadingState />
            ) : propostas.length > 0 ? (
              propostas.map((proposta) => (
                <PropostaTableRow
                  key={proposta.id}
                  proposta={proposta}
                  onEditProposta={onSelect}
                  onDeleteProposta={onDeleteProposta || (() => {})}
                  onGenerateProjeto={
                    typeof onGenerateProjeto === 'function'
                      ? onGenerateProjeto
                      : undefined
                  }
                />
              ))
            ) : (
              <PropostaEmptyState />
            )}
          </tbody>
        </Table>
      </div>
      <PropostaPagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default PropostaTable;
