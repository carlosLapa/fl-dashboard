import React, { useState } from 'react';
import {
  Table,
  Button,
  Pagination,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Collapse,
  Badge,
  ListGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faProjectDiagram,
  faChevronDown,
  faChevronUp,
  faPhone,
  faUser,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { ClienteDTO } from '../../types/cliente';
import ClienteTableHeader from './ClienteTableHeader';

interface ClienteTableProps {
  clientes: ClienteDTO[];
  onEditCliente: (id: number) => void;
  onDeleteCliente: (id: number) => void;
  onViewProjetos: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isLoading?: boolean;
  shouldDisableActions?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const ClienteTable: React.FC<ClienteTableProps> = ({
  clientes,
  onEditCliente,
  onDeleteCliente,
  onViewProjetos,
  page,
  onPageChange,
  totalPages,
  isLoading = false,
  shouldDisableActions = false,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const handleDeleteClick = (id: number) => {
    setShowConfirmDelete(id);
  };

  const handleConfirmDelete = (id: number) => {
    onDeleteCliente(id);
    setShowConfirmDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderPagination = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      0,
      Math.min(
        page - Math.floor(maxVisiblePages / 2),
        totalPages - maxVisiblePages
      )
    );
    const endPage = Math.min(startPage + maxVisiblePages, totalPages);

    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
      />
    );

    if (startPage > 0) {
      items.push(
        <Pagination.Item key={0} onClick={() => onPageChange(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    for (let i = startPage; i < endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item
          key={totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      />
    );

    return <Pagination>{items}</Pagination>;
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center p-4">
        <p>Nenhum cliente encontrado.</p>
      </div>
    );
  }

  return (
    <div className="cliente-table-container">
      <div className="table-responsive">
        <Table striped bordered hover className="cliente-table">
          <thead>
            <ClienteTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <React.Fragment key={cliente.id}>
                <tr>
                  <td className="text-center">
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => toggleRowExpand(cliente.id)}
                      aria-label={
                        expandedRows[cliente.id] ? 'Collapse row' : 'Expand row'
                      }
                    >
                      <FontAwesomeIcon
                        icon={
                          expandedRows[cliente.id] ? faChevronUp : faChevronDown
                        }
                        className="text-secondary"
                      />
                    </Button>
                  </td>
                  <td>
                    <strong className="text-primary">{cliente.numero}</strong>
                  </td>
                  <td>{cliente.name}</td>
                  <td>{cliente.morada}</td>
                  <td>{cliente.nif}</td>
                  <td>
                    {cliente.contacto}
                    {cliente.contactos && cliente.contactos.length > 1 && (
                      <Badge bg="info" className="ms-2">
                        +{cliente.contactos.length - 1}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {cliente.responsavel}
                    {cliente.responsaveis &&
                      cliente.responsaveis.length > 1 && (
                        <Badge bg="info" className="ms-2">
                          +{cliente.responsaveis.length - 1}
                        </Badge>
                      )}
                  </td>
                  <td>
                    {showConfirmDelete === cliente.id ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleConfirmDelete(cliente.id)}
                          disabled={shouldDisableActions}
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelDelete}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="action-icons">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`edit-tooltip-${cliente.id}`}>
                              Editar
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faPencilAlt}
                            onClick={() =>
                              !shouldDisableActions && onEditCliente(cliente.id)
                            }
                            className="edit-icon"
                            style={{
                              marginRight: '8px',
                              ...(shouldDisableActions ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`delete-tooltip-${cliente.id}`}>
                              Eliminar
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={() =>
                              !shouldDisableActions &&
                              handleDeleteClick(cliente.id)
                            }
                            className="delete-icon"
                            style={{
                              marginRight: '8px',
                              ...(shouldDisableActions ? disabledStyle : {}),
                            }}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`projetos-tooltip-${cliente.id}`}>
                              Ver Projetos
                            </Tooltip>
                          }
                        >
                          <FontAwesomeIcon
                            icon={faProjectDiagram}
                            onClick={() => onViewProjetos(cliente.id)}
                            className="view-projetos-icon"
                          />
                        </OverlayTrigger>
                      </div>
                    )}
                  </td>
                </tr>
                <tr className="expandable-row">
                  <td colSpan={8} className="p-0">
                    <Collapse in={expandedRows[cliente.id]}>
                      <div className="p-3">
                        <div className="row">
                          <div className="col-md-4">
                            <h6>
                              <FontAwesomeIcon
                                icon={faPhone}
                                className="me-2"
                              />
                              Contactos
                            </h6>
                            <ListGroup variant="flush" className="detail-list">
                              {cliente.contactos &&
                              cliente.contactos.length > 0 ? (
                                cliente.contactos.map((contacto, index) => (
                                  <ListGroup.Item
                                    key={`contacto-${index}`}
                                    className="py-2"
                                  >
                                    {contacto}
                                  </ListGroup.Item>
                                ))
                              ) : (
                                <ListGroup.Item className="py-2 text-muted">
                                  Nenhum contacto adicional
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </div>
                          <div className="col-md-4">
                            <h6>
                              <FontAwesomeIcon icon={faUser} className="me-2" />
                              Responsáveis
                            </h6>
                            <ListGroup variant="flush" className="detail-list">
                              {cliente.responsaveis &&
                              cliente.responsaveis.length > 0 ? (
                                cliente.responsaveis.map(
                                  (responsavel, index) => (
                                    <ListGroup.Item
                                      key={`responsavel-${index}`}
                                      className="py-2"
                                    >
                                      {responsavel}
                                    </ListGroup.Item>
                                  )
                                )
                              ) : (
                                <ListGroup.Item className="py-2 text-muted">
                                  Nenhum responsável adicional
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </div>
                          <div className="col-md-4">
                            <h6>
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="me-2"
                              />
                              Emails
                            </h6>
                            <ListGroup variant="flush" className="detail-list">
                              {cliente.emails && cliente.emails.length > 0 ? (
                                cliente.emails.map((email, index) => (
                                  <ListGroup.Item
                                    key={`email-${index}`}
                                    className="py-2"
                                  >
                                    {email}
                                  </ListGroup.Item>
                                ))
                              ) : (
                                <ListGroup.Item className="py-2 text-muted">
                                  Nenhum email adicional
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </div>
                        </div>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="pagination-container">
        {renderPagination()}
        <div className="page-info d-block d-sm-none">
          Página {page + 1} de {totalPages}
        </div>
      </div>
    </div>
  );
};

export default ClienteTable;
