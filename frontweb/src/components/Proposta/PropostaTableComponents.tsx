import React from 'react';
import { Proposta } from '../../types/proposta';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { usePermissions } from '../../hooks/usePermissions';
import { Permission } from '../../permissions/rolePermissions';

export const PropostaTableHeader: React.FC = () => (
  <thead>
    <tr>
      <th>Ano</th>
      <th>Designação</th>
      <th>Cliente</th>
      <th>Tipo</th>
      <th>Data Proposta</th>
      <th>Data Adjudicação</th>
      <th>Prazo</th>
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
  onGenerateProjeto?: (proposta: Proposta) => void;
}

export const PropostaTableRow: React.FC<PropostaTableRowProps> = ({
  proposta,
  onEditProposta,
  onDeleteProposta,
  onGenerateProjeto,
}) => {
  const { hasPermission } = usePermissions();
  return (
    <tr>
      <td>{proposta.propostaAno}</td>
      <td>{proposta.designacao}</td>
      <td>{proposta.clientes.map((c: any) => c.name).join(', ')}</td>
      <td>{proposta.tipo || '-'}</td>
      <td>
        {proposta.dataProposta
          ? new Date(proposta.dataProposta).toLocaleDateString()
          : '-'}
      </td>
      <td>
        {proposta.dataAdjudicacao
          ? new Date(proposta.dataAdjudicacao).toLocaleDateString()
          : '-'}
      </td>
      <td>
        {proposta.prazo ? new Date(proposta.prazo).toLocaleDateString() : '-'}{' '}
      </td>
      <td>{proposta.prioridade}</td>
      <td>{proposta.observacao || '-'}</td>
      <td>{proposta.status}</td>
      <td>
        <div className="action-icons">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-edit-${proposta.id}`}>Editar</Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faPencilAlt}
              onClick={() => onEditProposta(proposta)}
              className="mr-2 edit-icon"
              style={{ cursor: 'pointer' }}
            />
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-delete-${proposta.id}`}>Apagar</Tooltip>
            }
          >
            <FontAwesomeIcon
              icon={faTrashAlt}
              onClick={() => onDeleteProposta(proposta.id)}
              className="delete-icon"
              style={{ cursor: 'pointer', marginLeft: 8 }}
            />
          </OverlayTrigger>
          {/* Futuro: Ver detalhes da proposta */}
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-details-${proposta.id}`}>
                Ver Detalhes da Proposta
              </Tooltip>
            }
          >
            <span
              style={{
                marginLeft: 8,
                color: '#0d6efd',
                cursor: 'pointer',
                opacity: 0.6,
              }}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
          </OverlayTrigger>
          {/* Botão para gerar projeto se adjudicada, não possui projetoId e tem permissão */}
          {proposta.status === 'ADJUDICADA' &&
            onGenerateProjeto &&
            !proposta.projetoId &&
            hasPermission(Permission.ADJUDICAR_PROPOSTA) && (
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-generate-projeto-${proposta.id}`}>
                    Gerar Projeto
                  </Tooltip>
                }
              >
                <span
                  onClick={() => onGenerateProjeto(proposta)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#81a6f0', // $primary
                    color: '#222',
                    borderRadius: '10px',
                    padding: '6px 14px 6px 10px',
                    marginLeft: 10,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(129,166,240,0.15)',
                    cursor: 'pointer',
                    fontSize: 16,
                    border: 'none',
                    transition: 'background 0.2s',
                    letterSpacing: 0.2,
                  }}
                  className="highlight-generate-projeto-btn"
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    style={{ fontSize: 20, marginRight: 8, color: '#222' }}
                  />
                  Gerar Projeto
                </span>
              </OverlayTrigger>
            )}
          {/* Se já possui projetoId, mostra info */}
          {proposta.status === 'ADJUDICADA' && proposta.projetoId && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-projeto-exists-${proposta.id}`}>
                  Projeto já gerado
                </Tooltip>
              }
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#e0e0e0',
                  color: '#888',
                  borderRadius: '10px',
                  padding: '6px 14px 6px 10px',
                  marginLeft: 10,
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  letterSpacing: 0.2,
                  opacity: 0.7,
                  cursor: 'not-allowed',
                }}
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  style={{ fontSize: 20, marginRight: 8, color: '#888' }}
                />
                Projeto já gerado
              </span>
            </OverlayTrigger>
          )}
        </div>
      </td>
    </tr>
  );
};

interface PropostaPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PropostaPagination: React.FC<PropostaPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => (
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
    <span style={{ lineHeight: '2.2em' }}>
      {page + 1} / {totalPages}
    </span>
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
