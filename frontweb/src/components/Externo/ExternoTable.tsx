import React, { useState } from 'react';
import {
  Table,
  Button,
  Pagination,
  Spinner,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faProjectDiagram,
  faTasks,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { ExternoDTO, FaseProjeto } from 'types/externo';
import { useNavigate } from 'react-router-dom';
import './externoTableStyles.scss';

interface ExternoTableProps {
  externos: ExternoDTO[];
  onEditExterno?: (id: number) => void;  
  onDeleteExterno?: (id: number) => void; 
  onViewTasks?: (id: number) => void;    
  onViewProjetos?: (id: number) => void; 
  page?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  isLoading?: boolean;
  showPagination?: boolean; 
  simplified?: boolean; 
  shouldDisableActions?: boolean; // Add this new prop to the interface
}

const ExternoTable: React.FC<ExternoTableProps> = ({
  externos,
  onEditExterno,
  onDeleteExterno,
  onViewTasks,
  onViewProjetos,
  page = 0,
  onPageChange,
  totalPages = 1,
  isLoading = false,
  showPagination = true,
  simplified = false,
  shouldDisableActions = false, // Default to not disabled
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  // Common style for disabled icons
  const disabledStyle: React.CSSProperties = {
    color: '#ccc',
    cursor: 'not-allowed',
    opacity: 0.6,
    pointerEvents: 'none',
  };

  const handleDeleteClick = (id: number) => {
    if (shouldDisableActions) return;
    setShowConfirmDelete(id);
  };

  const handleConfirmDelete = (id: number) => {
    if (shouldDisableActions) return;
    if (onDeleteExterno) {
      onDeleteExterno(id);
    }
    setShowConfirmDelete(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/externos/${id}/details`);
  };

  const handleViewTasks = (id: number) => {
    if (onViewTasks) {
      onViewTasks(id);
    } else {
      // Default navigation with appropriate endpoint that returns full data
      navigate(`/externos/${id}/tarefas`, {
        state: { 
          externoId: id,
          useFull: true // Flag to indicate full data should be used
        }
      });
    }
  };

  const renderFaseProjetoBadge = (fase: FaseProjeto) => {
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

  const renderEspecialidades = (especialidades: string[]) => {
    return especialidades.map((esp, index) => (
      <Badge key={index} bg="secondary" className="me-1 mb-1">
        {esp.replace('_', ' ')}
      </Badge>
    ));
  };

  const renderPagination = () => {
    if (!showPagination || !onPageChange) return null;
    
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

  if (externos.length === 0) {
    return (
      <div className="text-center p-4">
        <p>Nenhum colaborador externo encontrado.</p>
      </div>
    );
  }

  return (
    <div className={simplified ? "" : "externo-table-container"}>
      <div className="table-responsive">
        <Table striped bordered hover className="externo-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telemóvel</th>
              <th>Preço {simplified ? "" : "(€/hora)"}</th>
              <th>Fase do Projeto</th>
              <th>Especialidades</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {externos.length > 0 ? (
              externos.map((externo) => (
                <tr key={externo.id}>
                  <td>{externo.name}</td>
                  <td>{externo.email}</td>
                  <td>{externo.telemovel}</td>
                  <td>{simplified 
                    ? new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(externo.preco)
                    : externo.preco.toFixed(2) + ' €'
                  }</td>
                  <td>{renderFaseProjetoBadge(externo.faseProjeto)}</td>
                  <td>
                    <div className="d-flex flex-wrap">
                      {renderEspecialidades(externo.especialidades)}
                    </div>
                  </td>
                  <td>
                    {showConfirmDelete === externo.id ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleConfirmDelete(externo.id)}
                          disabled={shouldDisableActions}
                          style={shouldDisableActions ? disabledStyle : {}}
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
                        {onEditExterno && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`edit-tooltip-${externo.id}`}>
                                Editar
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faPencilAlt}
                              onClick={() => !shouldDisableActions && onEditExterno(externo.id)}
                              className="edit-icon"
                              style={{ 
                                marginRight: '8px',
                                ...(shouldDisableActions ? disabledStyle : {})
                              }}
                            />
                          </OverlayTrigger>
                        )}
                        
                        {onDeleteExterno && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`delete-tooltip-${externo.id}`}>
                                Eliminar
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faTrashAlt}
                              onClick={() => !shouldDisableActions && handleDeleteClick(externo.id)}
                              className="delete-icon"
                              style={{ 
                                marginRight: '8px',
                                ...(shouldDisableActions ? disabledStyle : {})
                              }}
                            />
                          </OverlayTrigger>
                        )}
                        
                        {onViewTasks && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tasks-tooltip-${externo.id}`}>
                                Ver Tarefas atribuídas
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faTasks}
                              onClick={() => !shouldDisableActions && handleViewTasks(externo.id)}
                              className="view-tasks-icon"
                              style={{ 
                                marginRight: '8px',
                                ...(shouldDisableActions ? disabledStyle : {})
                              }}
                            />
                          </OverlayTrigger>
                        )}
                        
                        {onViewProjetos && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`projetos-tooltip-${externo.id}`}>
                                Ver Projetos
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faProjectDiagram}
                              onClick={() => !shouldDisableActions && onViewProjetos(externo.id)}
                              className="view-projetos-icon"
                              style={{ 
                                marginRight: simplified ? '0' : '8px',
                                ...(shouldDisableActions ? disabledStyle : {})
                              }}
                            />
                          </OverlayTrigger>
                        )}
                        
                        {/* Always show details button if we're in simplified mode */}
                        {simplified && (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`details-tooltip-${externo.id}`}>
                                Ver Detalhes
                              </Tooltip>
                            }
                          >
                            <FontAwesomeIcon
                              icon={faInfoCircle}
                              onClick={() => handleViewDetails(externo.id)}
                              className="info-icon"
                            />
                          </OverlayTrigger>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  Não há colaboradores externos associados a este projeto.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      {showPagination && onPageChange && (
        <div className="pagination-container">
          {renderPagination()}
          <div className="page-info d-block d-sm-none">
            Página {page + 1} de {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternoTable;
