import React from 'react';
import Table from 'react-bootstrap/Table';
import { TarefaWithUserAndProjetoDTO } from '../../types/tarefa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencilAlt,
  faTrashAlt,
  faInfoCircle,
  faSort,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';
import {
  OverlayTrigger,
  Tooltip,
  Pagination,
  Form,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import './styles.scss';

interface TarefaTableProps {
  tarefas: TarefaWithUserAndProjetoDTO[];
  onEditTarefa: (tarefaId: number) => void;
  onDeleteTarefa: (tarefaId: number) => void;
  onViewDetails: (tarefaId: number) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  // New date filter props
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApplyDateFilter: () => void;
  onClearDateFilter: () => void;
  dateFilterField: string;
  onDateFilterFieldChange: (field: string) => void;
  sortField: string;
  sortDirection: 'ASC' | 'DESC';
  onSort: (field: string) => void;
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  onEditTarefa,
  onDeleteTarefa,
  onViewDetails,
  page,
  totalPages,
  onPageChange,
  isLoading,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyDateFilter,
  onClearDateFilter,
  dateFilterField,
  onDateFilterFieldChange,
  sortField,
  sortDirection,
  onSort,
}) => {
  console.log('Tarefas in Table:', tarefas); // Add this debug log

  if (isLoading) {
    return <div className="text-center">Carregando tarefas...</div>;
  }

  const hasTarefas = Array.isArray(tarefas) && tarefas.length > 0;

  // Helper function to render sortable column headers
  const renderSortableHeader = (
    field: string,
    label: string,
    className?: string
  ) => {
    return (
      <th
        className={className || ''}
        onClick={() => onSort(field)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <span>{label}</span>
          <span className="ms-1">
            {sortField === field ? (
              <FontAwesomeIcon
                icon={sortDirection === 'ASC' ? faSortUp : faSortDown}
                size="sm"
              />
            ) : (
              <FontAwesomeIcon icon={faSort} size="sm" opacity={0.3} />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="tarefa-container">
      {/* Date Filter Section - Improved for responsiveness */}
      <div className="date-filter-container mb-4 p-3 border rounded bg-light">
        <h5 className="mb-3">Filtrar por Data</h5>
        <Row className="g-3">
          <Col xs={12} md={3}>
            <Form.Group>
              <Form.Label>Campo de Data</Form.Label>
              <Form.Select
                value={dateFilterField}
                onChange={(e) => onDateFilterFieldChange(e.target.value)}
              >
                {/* Changed label from "Prazo Estimado" to "Início" */}
                <option value="prazoEstimado">Início</option>
                <option value="prazoReal">Prazo</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Form.Group>
              <Form.Label>Data Inicial</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={3}>
            <Form.Group>
              <Form.Label>Data Final</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col
            xs={12}
            md={3}
            className="d-flex align-items-end date-filter-actions"
          >
            <Button
              variant="primary"
              onClick={onApplyDateFilter}
              className="me-2"
            >
              Aplicar Filtro
            </Button>
            <Button variant="outline-secondary" onClick={onClearDateFilter}>
              Limpar
            </Button>
          </Col>
        </Row>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {renderSortableHeader('descricao', 'Descrição')}
              {renderSortableHeader('status', 'Estado')}
              {/* Changed label from "Prazo Estimado" to "Início" */}
              {renderSortableHeader('prazoEstimado', 'Início', 'prazo-column')}
              {/* Changed label from "Prazo Real" to "Prazo" */}
              {renderSortableHeader('prazoReal', 'Prazo', 'prazo-column')}
              {renderSortableHeader(
                'workingDays',
                'Dias Úteis',
                'prazo-column'
              )}
              <th>Atribuição</th>
              <th>Externos</th> {/* New column for Externos */}
              {renderSortableHeader('projeto.designacao', 'Projeto')}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {hasTarefas ? (
              tarefas.map((tarefa) => (
                <tr key={tarefa.id}>
                  <td>{tarefa.descricao}</td>
                  <td>{tarefa.status}</td>
                  <td className="prazo-column">
                    {tarefa.prazoEstimado
                      ? new Date(tarefa.prazoEstimado).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="prazo-column">
                    {tarefa.prazoReal
                      ? new Date(tarefa.prazoReal).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="prazo-column">
                    {tarefa.workingDays !== undefined
                      ? `${tarefa.workingDays} dia(s)`
                      : '-'}
                  </td>
                  <td>{tarefa.users.map((user) => user.name).join(', ')}</td>
                  <td>
                    {/* Display externos if they exist */}
                    {tarefa.externos && tarefa.externos.length > 0
                      ? tarefa.externos
                          .map((externo) => externo.name)
                          .join(', ')
                      : '-'}
                  </td>
                  <td>{tarefa.projeto.designacao}</td>
                  <td>
                    <div className="action-icons">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`edit-tooltip-${tarefa.id}`}>
                            Editar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faPencilAlt}
                          onClick={() => onEditTarefa(tarefa.id)}
                          className="action-icon edit-icon"
                          style={{ marginRight: '8px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`delete-tooltip-${tarefa.id}`}>
                            Apagar
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => onDeleteTarefa(tarefa.id)}
                          className="action-icon delete-icon"
                          style={{ marginRight: '8px' }}
                        />
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`details-tooltip-${tarefa.id}`}>
                            Ver Detalhes
                          </Tooltip>
                        }
                      >
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          onClick={() => onViewDetails(tarefa.id)}
                          className="action-icon view-details-icon"
                        />
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center">
                  Não existem tarefas
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination className="flex-wrap">
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

export default TarefaTable;
