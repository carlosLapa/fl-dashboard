import React, { useState } from 'react';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import {
  Pagination,
  Table,
  Form,
  Button,
  Row,
  Col,
  Card,
  Collapse,
  Spinner
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faEye,
  faInfoCircle,
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import './ProjetoTable.scss';

interface ProjetoTableProps {
  projetos: Projeto[];
  onEditProjeto: (id: number) => void;
  onDeleteProjeto: (id: number) => void;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  // Date filter props
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  // Text filter props
  designacaoFilter: string;
  entidadeFilter: string;
  prioridadeFilter: string;
  onDesignacaoFilterChange: (value: string) => void;
  onEntidadeFilterChange: (value: string) => void;
  onPrioridadeFilterChange: (value: string) => void;
  // Filter actions
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const ProjetoTable: React.FC<ProjetoTableProps> = ({
  projetos,
  onEditProjeto,
  onDeleteProjeto,
  page,
  onPageChange,
  totalPages,
  statusFilter,
  onStatusFilterChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  designacaoFilter,
  entidadeFilter,
  prioridadeFilter,
  onDesignacaoFilterChange,
  onEntidadeFilterChange,
  onPrioridadeFilterChange,
  onApplyFilters,
  onClearFilters,
  isLoading,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderUserNames = (users: User[]) => {
    return users.map((user) => user.name).join(', ');
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando projetos...</span>
        </Spinner>
        <p className="mt-2">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="projeto-container">
      {/* Enhanced Filter Section */}
      <Card className="mb-4">
        <Card.Header
          className="d-flex justify-content-between align-items-center"
          onClick={() => setShowFilters(!showFilters)}
          style={{ cursor: 'pointer' }}
        >
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faFilter} className="me-2" />
            Filtros
          </h5>
          <FontAwesomeIcon icon={showFilters ? faChevronUp : faChevronDown} />
        </Card.Header>

        <Collapse in={showFilters}>
          <div>
            <Card.Body>
              <Row className="g-3">
                {/* Text Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Designação</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filtrar por designação"
                      value={designacaoFilter}
                      onChange={(e) => onDesignacaoFilterChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Entidade</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filtrar por entidade"
                      value={entidadeFilter}
                      onChange={(e) => onEntidadeFilterChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Prioridade</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Filtrar por prioridade"
                      value={prioridadeFilter}
                      onChange={(e) => onPrioridadeFilterChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                {/* Date Filters */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Data Inicial</Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => onStartDateChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Data Final</Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => onEndDateChange(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                {/* Status Filter */}
                <Col md={6} lg={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => onStatusFilterChange(e.target.value)}
                    >
                      <option value="ALL">Todos</option>
                      <option value="ATIVO">Ativo</option>
                      <option value="EM_PROGRESSO">Em Progresso</option>
                      <option value="CONCLUIDO">Concluído</option>
                      <option value="SUSPENSO">Suspenso</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-between mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={onClearFilters}
                  className="clear-filters-btn"
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Limpar Filtros
                </Button>
                <Button
                  variant="primary"
                  onClick={onApplyFilters}
                  className="apply-filters-btn"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </Card.Body>
          </div>
        </Collapse>
      </Card>

      {/* Table Section */}
      <div className="table-responsive">
        {projetos.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Ano</th>
                <th>Designação</th>
                <th>Entidade</th>
                <th>Prioridade</th>
                <th className="d-none d-md-table-cell">Observação</th>
                <th>Prazo</th>
                <th className="d-none d-lg-table-cell">Colaboradores</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((projeto) => (
                <tr key={projeto.id}>
                  <td>{projeto.projetoAno}</td>
                  <td>{projeto.designacao}</td>
                  <td>{projeto.entidade}</td>
                  <td>{projeto.prioridade}</td>
                  <td className="d-none d-md-table-cell">
                    {projeto.observacao}
                  </td>
                  <td>{formatDate(projeto.prazo)}</td>
                  <td className="d-none d-lg-table-cell">
                    {renderUserNames(projeto.users)}
                  </td>
                  <td>
                    <ProjetoStatusBadge status={projeto.status} />
                  </td>
                  <td>
                    <div className="action-icons">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-${projeto.id}`}>Editar</Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditProjeto(projeto.id)}
                          className="mr-2 edit-icon"
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-${projeto.id}`}>Apagar</Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteProjeto(projeto.id)}
                          className="delete-icon"
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-${projeto.id}`}>
                            Ver Kanban Board
                          </Tooltip>
                        }
                      >
                        <Link
                          to={`/projetos/${projeto.id}/full`}
                          className="view-icon"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-details-${projeto.id}`}>
                            Ver Detalhes do Projeto
                          </Tooltip>
                        }
                      >
                        <Link
                          to={`/projetos/${projeto.id}/details`}
                          className="info-icon"
                          style={{ marginLeft: '2px' }}
                        >
                          <FontAwesomeIcon icon={faInfoCircle} />
                        </Link>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center p-4">
            <p>Não foram encontrados projetos.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx}
                active={idx === page}
                onClick={() => onPageChange(idx)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ProjetoTable;
