import React from 'react';
import { Proposta } from '../../types/proposta';
import { Button } from 'react-bootstrap';


export const PropostaTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th>Ano</th>
      <th>Designação</th>
      <th>Cliente</th>
      <th>Tipo</th>
      <th>Data Proposta</th>
      <th>Data Adjudicação</th>
      <th>Prioridade</th>
      <th>Observação</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
  </thead>
);

interface PropostaTableRowProps {
  proposta: Proposta;
  onEditProposta: (proposta: Proposta) => void;
  onDeleteProposta: (id: number) => void;
}

export const PropostaTableRow: React.FC<PropostaTableRowProps> = ({ proposta, onEditProposta, onDeleteProposta }) => (
  <tr>
    <td>{proposta.propostaAno}</td>
    <td>{proposta.designacao}</td>
    <td>{proposta.clientes.map(c => c.name).join(', ')}</td>
    <td>{proposta.tipo || '-'}</td>
    <td>{proposta.dataProposta ? new Date(proposta.dataProposta).toLocaleDateString() : '-'}</td>
    <td>{proposta.dataAdjudicacao ? new Date(proposta.dataAdjudicacao).toLocaleDateString() : '-'}</td>
    <td>{proposta.prioridade}</td>
    <td>{proposta.observacao || '-'}</td>
    <td>{proposta.status}</td>
    <td>
      <Button size="sm" variant="outline-primary" onClick={() => onEditProposta(proposta)} className="me-2">Editar</Button>
      <Button size="sm" variant="outline-danger" onClick={() => onDeleteProposta(proposta.id)}>Excluir</Button>
    </td>
  </tr>
);

interface PropostaPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PropostaPagination: React.FC<PropostaPaginationProps> = ({ page, totalPages, onPageChange }) => (
  <div className="d-flex justify-content-center mt-3">
    <Button
      size="sm"
      variant="secondary"
      onClick={() => onPageChange(page - 1)}
      disabled={page === 0}
      className="me-2"
    >
      Anterior
    </Button>
    <span style={{ lineHeight: '2.2em' }}>{page + 1} / {totalPages}</span>
    <Button
      size="sm"
      variant="secondary"
      onClick={() => onPageChange(page + 1)}
      disabled={page + 1 >= totalPages}
      className="ms-2"
    >
      Próxima
    </Button>
  </div>
);


export const PropostaEmptyState: React.FC = () => (
  <tr>
    <td colSpan={10} className="text-center text-muted py-4">
      Nenhuma proposta encontrada.
    </td>
  </tr>
);


export const PropostaLoadingState: React.FC = () => (
  <tr>
    <td colSpan={10} className="text-center py-4">
      A carregar propostas...
    </td>
  </tr>
);
