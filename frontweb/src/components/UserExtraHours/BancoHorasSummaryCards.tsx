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

const signLabel = (hours: number): string => {
  if (hours > 0) return 'horas acumuladas';
  if (hours < 0) return 'horas em falta';
  return 'sem registos neste período';
};

/**
 * Replaces the bare <ul> monthly/weekly lists that used to live inside
 * UserExtraHoursCalendar: three at-a-glance figures for the "Banco de Horas"
 * page - the lifetime balance is what gives the feature its name. Each card
 * spells out what the sign means (positive = acumuladas, negative = em
 * falta) instead of relying only on colour/symbol.
 */
const BancoHorasSummaryCards: React.FC<BancoHorasSummaryCardsProps> = ({
  saldoAcumulado,
  totalMesAtual,
  totalSemanaAtual,
}) => {
  return (
    <div className="banco-horas-summary-cards">
      <Row className="g-3">
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">
                Saldo Acumulado
              </Card.Subtitle>
              <Card.Title className={`mb-1 ${signClass(saldoAcumulado)}`}>
                {formatHours(saldoAcumulado)}
              </Card.Title>
              <div className={`small ${signClass(saldoAcumulado)}`}>
                {signLabel(saldoAcumulado)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">
                Total do Mês Atual
              </Card.Subtitle>
              <Card.Title className={`mb-1 ${signClass(totalMesAtual)}`}>
                {formatHours(totalMesAtual)}
              </Card.Title>
              <div className={`small ${signClass(totalMesAtual)}`}>
                {signLabel(totalMesAtual)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">
                Total da Semana Atual
              </Card.Subtitle>
              <Card.Title className={`mb-1 ${signClass(totalSemanaAtual)}`}>
                {formatHours(totalSemanaAtual)}
              </Card.Title>
              <div className={`small ${signClass(totalSemanaAtual)}`}>
                {signLabel(totalSemanaAtual)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <p className="banco-horas-legend text-muted small mb-0 mt-2">
        Valores positivos (+) são horas acumuladas (trabalhadas a mais);
        valores negativos (-) são horas em falta. Os lançamentos são feitos
        em incrementos de meia hora (0,5h).
      </p>
    </div>
  );
};

export default BancoHorasSummaryCards;
