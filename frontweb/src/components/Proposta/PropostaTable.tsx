import React from 'react';
import { Proposta } from '../../types/proposta';
import { Table } from 'react-bootstrap';
import {
  PropostaTableHeader,
  PropostaTableRow,
  PropostaPagination,
  PropostaEmptyState,
  PropostaLoadingState,
} from './PropostaTableComponents';

interface PropostaTableProps {
  propostas: Proposta[];
  onSelect: (proposta: Proposta) => void;
  onDeleteProposta?: (id: number) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  isLoading?: boolean;
}

const PropostaTable: React.FC<PropostaTableProps> = ({
  propostas,
  onSelect,
  onDeleteProposta,
  page = 0,
  onPageChange = () => {},
  totalPages = 1,
  isLoading = false,
}) => {
  return (
    <div className="proposta-container">
      <div className="table-responsive">
        <Table striped bordered hover>
          <PropostaTableHeader />
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
                />
              ))
            ) : (
              <PropostaEmptyState />
            )}
          </tbody>
        </Table>
      </div>
      <PropostaPagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default PropostaTable;
