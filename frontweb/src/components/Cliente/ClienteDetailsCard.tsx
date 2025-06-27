import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPhone,
  faUser,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
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

              <div className="detail-section mb-3">
                <h6 className="detail-section-title">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  Contactos
                </h6>
                <ListGroup variant="flush" className="detail-list">
                  {cliente.contacto && (
                    <ListGroup.Item className="py-2">
                      <strong>Principal:</strong> {cliente.contacto}
                    </ListGroup.Item>
                  )}

                  {cliente.contactos && cliente.contactos.length > 0 ? (
                    cliente.contactos
                      .filter((c) => c !== cliente.contacto) // Filter out the main contact
                      .map((contacto, index) => (
                        <ListGroup.Item
                          key={`contacto-${index}`}
                          className="py-2"
                        >
                          {contacto}
                        </ListGroup.Item>
                      ))
                  ) : cliente.contacto ? null : (
                    <ListGroup.Item className="py-2 text-muted">
                      Nenhum contacto disponível
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>

              <div className="detail-section mb-3">
                <h6 className="detail-section-title">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Responsáveis
                </h6>
                <ListGroup variant="flush" className="detail-list">
                  {cliente.responsavel && (
                    <ListGroup.Item className="py-2">
                      <strong>Principal:</strong> {cliente.responsavel}
                    </ListGroup.Item>
                  )}

                  {cliente.responsaveis && cliente.responsaveis.length > 0 ? (
                    cliente.responsaveis
                      .filter((r) => r !== cliente.responsavel) // Filter out the main responsavel
                      .map((responsavel, index) => (
                        <ListGroup.Item
                          key={`responsavel-${index}`}
                          className="py-2"
                        >
                          {responsavel}
                        </ListGroup.Item>
                      ))
                  ) : cliente.responsavel ? null : (
                    <ListGroup.Item className="py-2 text-muted">
                      Nenhum responsável disponível
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>

              <div className="detail-section mb-3">
                <h6 className="detail-section-title">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  Emails
                </h6>
                <ListGroup variant="flush" className="detail-list">
                  {cliente.emails && cliente.emails.length > 0 ? (
                    cliente.emails.map((email, index) => (
                      <ListGroup.Item key={`email-${index}`} className="py-2">
                        {email}
                      </ListGroup.Item>
                    ))
                  ) : (
                    <ListGroup.Item className="py-2 text-muted">
                      Nenhum email disponível
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </div>

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
