import React, { useState } from 'react';
import {
  Table,
  Button,
  Pagination,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { ClienteDTO } from 'types/cliente';
import './clienteTableStyles.scss';

interface ClienteTableProps {
  clientes: ClienteDTO[];
  onEditCliente: (id: number) => void;
  onDeleteCliente: (id: number) => void;
  onViewProjetos: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isLoading?: boolean;
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
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );

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

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
      />
    );

    // First page
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

    // Page numbers
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

    // Last page
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

    // Next button
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
            <tr>
              <th>Nome</th>
              <th>Morada</th>
              <th>NIF</th>
              <th>Contacto</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.name}</td>
                <td>{cliente.morada}</td>
                <td>{cliente.nif}</td>
                <td>{cliente.contacto}</td>
                <td>{cliente.responsavel}</td>
                <td>
                  {showConfirmDelete === cliente.id ? (
                    <div className="d-flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleConfirmDelete(cliente.id)}
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
                          onClick={() => onEditCliente(cliente.id)}
                          className="edit-icon"
                          style={{ marginRight: '8px' }}
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
                          onClick={() => handleDeleteClick(cliente.id)}
                          className="delete-icon"
                          style={{ marginRight: '8px' }}
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
