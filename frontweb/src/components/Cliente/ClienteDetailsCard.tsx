import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { ClienteDTO } from 'types/cliente';
import './clienteDetailsCard.scss';

interface ClienteDetailsCardProps {
  cliente: ClienteDTO;
  onClose: () => void;
}

const ClienteDetailsCard: React.FC<ClienteDetailsCardProps> = ({
  cliente,
  onClose,
}) => {
  return (
    <>
      <div className="cliente-details-card-overlay" onClick={onClose}></div>
      <div className="cliente-details-card">
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Detalhes do Cliente</h5>
            <Button variant="link" className="p-0" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Card.Header>
          <Card.Body>
            <Card.Title>{cliente.name}</Card.Title>
            <div className="mt-3">
              <p className="mb-2">
                <strong>Morada:</strong> {cliente.morada || 'Não disponível'}
              </p>
              <p className="mb-2">
                <strong>NIF:</strong> {cliente.nif || 'Não disponível'}
              </p>
              <p className="mb-2">
                <strong>Contacto:</strong>{' '}
                {cliente.contacto || 'Não disponível'}
              </p>
              <p className="mb-2">
                <strong>Responsável:</strong>{' '}
                {cliente.responsavel || 'Não disponível'}
              </p>
              {cliente.createdAt && (
                <p className="mb-2">
                  <strong>Data de Criação:</strong>{' '}
                  {new Date(cliente.createdAt).toLocaleDateString('pt-PT')}
                </p>
              )}
              {cliente.updatedAt && (
                <p className="mb-2">
                  <strong>Última Atualização:</strong>{' '}
                  {new Date(cliente.updatedAt).toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default ClienteDetailsCard;
