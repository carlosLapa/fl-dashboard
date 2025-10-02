import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { Proposta } from '../../types/proposta';
import { formatDate } from '../../utils/dateUtils';

interface PropostaDetailsTableProps {
  proposta: Proposta;
}

const PropostaDetailsTable: React.FC<PropostaDetailsTableProps> = ({
  proposta,
}) => {
  const renderStatusBadge = (status: string) => {
    let variant = 'secondary';

    switch (status) {
      case 'EM ANÁLISE':
        variant = 'warning';
        break;
      case 'ADJUDICADA':
        variant = 'success';
        break;
      case 'REJEITADA':
        variant = 'danger';
        break;
      default:
        variant = 'info';
    }

    return (
      <Badge
        pill
        bg={variant}
        style={{ fontSize: '0.9rem', padding: '0.5em 1em' }}
      >
        {status}
      </Badge>
    );
  };

  const renderPrioridadeBadge = (prioridade: string) => {
    let variant = 'secondary';

    switch (prioridade.toUpperCase()) {
      case 'ALTA':
        variant = 'danger';
        break;
      case 'MÉDIA':
        variant = 'warning';
        break;
      case 'BAIXA':
        variant = 'success';
        break;
      default:
        variant = 'info';
    }

    return (
      <Badge
        pill
        bg={variant}
        style={{ fontSize: '0.9rem', padding: '0.5em 1em' }}
      >
        {prioridade}
      </Badge>
    );
  };

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <tbody>
          <tr>
            <th className="bg-light" style={{ width: '200px' }}>
              ID
            </th>
            <td>{proposta.id}</td>
          </tr>
          <tr>
            <th className="bg-light">Ano</th>
            <td>{proposta.propostaAno}</td>
          </tr>
          <tr>
            <th className="bg-light">Designação</th>
            <td>{proposta.designacao}</td>
          </tr>
          <tr>
            <th className="bg-light">Cliente(s)</th>
            <td>
              {proposta.clientes?.map((cliente) => cliente.name).join(', ') ||
                'N/A'}
            </td>
          </tr>
          <tr>
            <th className="bg-light">Tipo</th>
            <td>{proposta.tipo || 'N/A'}</td>
          </tr>
          <tr>
            <th className="bg-light">Prioridade</th>
            <td>{renderPrioridadeBadge(proposta.prioridade)}</td>
          </tr>
          <tr>
            <th className="bg-light">Status</th>
            <td>{renderStatusBadge(proposta.status)}</td>
          </tr>
          <tr>
            <th className="bg-light">Data da Proposta</th>
            <td>
              {proposta.dataProposta
                ? formatDate(proposta.dataProposta)
                : 'N/A'}
            </td>
          </tr>
          <tr>
            <th className="bg-light">Data de Adjudicação</th>
            <td>
              {proposta.dataAdjudicacao
                ? formatDate(proposta.dataAdjudicacao)
                : 'N/A'}
            </td>
          </tr>
          <tr>
            <th className="bg-light">Prazo</th>
            <td>{proposta.prazo ? formatDate(proposta.prazo) : 'N/A'}</td>
          </tr>
          <tr>
            <th className="bg-light">Observação</th>
            <td style={{ whiteSpace: 'pre-wrap' }}>
              {proposta.observacao || 'N/A'}
            </td>
          </tr>
          {proposta.projetoId && (
            <tr>
              <th className="bg-light">Projeto Associado</th>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  href={`/projetos/${proposta.projetoId}/details`}
                >
                  Ver Projeto #{proposta.projetoId}
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PropostaDetailsTable;
