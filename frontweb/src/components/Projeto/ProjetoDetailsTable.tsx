import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { Projeto } from '../../types/projeto';
import { User } from '../../types/user';
import ProjetoStatusBadge from './ProjetoStatusBadge';
import './ProjetoDetailsTable.scss';

interface ProjetoDetailsTableProps {
  projeto: Projeto;
  onStatusChange: (newStatus: string) => Promise<void>;
}

const ProjetoDetailsTable: React.FC<ProjetoDetailsTableProps> = ({
  projeto,
  onStatusChange,
}) => {
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

  return (
    <Card className="projeto-details-card">
      <Card.Body>
        <Row className="mb-3">
          <Col xs={12} md={6} className="mb-3 mb-md-0">
            <div className="detail-item">
              <div className="detail-label">Ano</div>
              <div className="detail-value">{projeto.projetoAno}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-item">
              <div className="detail-label">Designação</div>
              <div className="detail-value">{projeto.designacao}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col xs={12} md={6} className="mb-3 mb-md-0">
            <div className="detail-item">
              <div className="detail-label">Entidade</div>
              <div className="detail-value">{projeto.entidade}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-item">
              <div className="detail-label">Prioridade</div>
              <div className="detail-value">{projeto.prioridade}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col xs={12}>
            <div className="detail-item">
              <div className="detail-label">Observação</div>
              <div className="detail-value">{projeto.observacao}</div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col xs={12} md={6} className="mb-3 mb-md-0">
            <div className="detail-item">
              <div className="detail-label">Prazo</div>
              <div className="detail-value">{formatDate(projeto.prazo)}</div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="detail-item">
              <div className="detail-label">Status</div>
              <div className="detail-value status-container">
                <Form.Select
                  value={projeto.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="status-select me-2"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="EM_PROGRESSO">Em Progresso</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="SUSPENSO">Suspenso</option>
                </Form.Select>
                <ProjetoStatusBadge status={projeto.status} />
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <div className="detail-item">
              <div className="detail-label">Colaboradores</div>
              <div className="detail-value">
                {renderUserNames(projeto.users)}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProjetoDetailsTable;
