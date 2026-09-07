import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import './BancoHorasSummaryCards.scss';

interface BancoHorasSummaryCardsProps {
  saldoAcumulado: number;
  totalMesAtual: number;
  totalSemanaAtual: number;
}

const formatHours = (hours: number): string =>
  `${hours > 0 ? '+' : ''}${hours}h`;

const signClass = (hours: number): string => {
  if (hours > 0) return 'text-success';
  if (hours < 0) return 'text-danger';
  return 'text-muted';
};

/**
 * Replaces the bare <ul> monthly/weekly lists that used to live inside
 * UserExtraHoursCalendar: three at-a-glance figures for the "Banco de Horas"
 * page - the lifetime balance is what gives the feature its name.
 */
const BancoHorasSummaryCards: React.FC<BancoHorasSummaryCardsProps> = ({
  saldoAcumulado,
  totalMesAtual,
  totalSemanaAtual,
}) => {
  return (
    <Row className="banco-horas-summary-cards g-3">
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body>
            <Card.Subtitle className="text-muted mb-2">
              Saldo Acumulado
            </Card.Subtitle>
            <Card.Title className={`mb-0 ${signClass(saldoAcumulado)}`}>
              {formatHours(saldoAcumulado)}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body>
            <Card.Subtitle className="text-muted mb-2">
              Total do Mês Atual
            </Card.Subtitle>
            <Card.Title className={`mb-0 ${signClass(totalMesAtual)}`}>
              {formatHours(totalMesAtual)}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="text-center h-100">
          <Card.Body>
            <Card.Subtitle className="text-muted mb-2">
              Total da Semana Atual
            </Card.Subtitle>
            <Card.Title className={`mb-0 ${signClass(totalSemanaAtual)}`}>
              {formatHours(totalSemanaAtual)}
            </Card.Title>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default BancoHorasSummaryCards;
