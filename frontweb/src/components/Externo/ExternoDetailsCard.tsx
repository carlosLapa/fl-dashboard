import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ExternoDTO } from 'types/externo';
import './externoDetailsCard.scss';

interface ExternoDetailsCardProps {
  externo: ExternoDTO;
  onClose: () => void;
}

const ExternoDetailsCard: React.FC<ExternoDetailsCardProps> = ({
  externo,
  onClose,
}) => {
  const renderFaseProjetoBadge = (fase: string) => {
    let variant = 'secondary';

    switch (fase) {
      case 'LICENCIAMENTO':
        variant = 'primary';
        break;
      case 'EXECUCAO':
        variant = 'success';
        break;
      case 'COMUNICACAO_PREVIA':
        variant = 'info';
        break;
      case 'ASSISTENCIA_TECNICA':
        variant = 'warning';
        break;
      case 'PROGRAMA_BASE':
        variant = 'danger';
        break;
      case 'ESTUDO_PREVIO':
        variant = 'dark';
        break;
      case 'PEDIDO_INFORMACAO_PREVIO':
        variant = 'light';
        break;
    }

    return <Badge bg={variant}>{fase.replace('_', ' ')}</Badge>;
  };

  return (
    <>
      <div className="externo-details-card-overlay" onClick={onClose}></div>
      <div className="externo-details-card">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Detalhes do Colaborador Externo</h5>
            <Button variant="link" className="p-0" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>{externo.name}</Card.Title>
            <div className="mt-3">
              <p className="mb-2">
                <strong>Email:</strong> {externo.email}
              </p>
              <p className="mb-2">
                <strong>Telemóvel:</strong> {externo.telemovel}
              </p>
              <p className="mb-2">
                <strong>Preço (€/hora):</strong> {externo.preco.toFixed(2)} €
              </p>
              <p className="mb-2">
                <strong>Fase do Projeto:</strong>{' '}
                {renderFaseProjetoBadge(externo.faseProjeto)}
              </p>
              <div className="mb-2">
                <strong>Especialidades:</strong>
                <div className="d-flex flex-wrap mt-1">
                  {externo.especialidades.map((esp, index) => (
                    <Badge key={index} bg="secondary" className="me-1 mb-1">
                      {esp.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default ExternoDetailsCard;
