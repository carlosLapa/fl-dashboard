import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import './MetricsKpiCard.scss';

interface MetricsKpiCardProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  badge?: {
    text: string;
    variant: string;
  };
  footer?: string;
  icon?: React.ReactNode;
}

const MetricsKpiCard: React.FC<MetricsKpiCardProps> = ({
  label,
  value,
  variant = 'default',
  badge,
  footer,
  icon,
}) => {
  return (
    <Card className={`metrics-kpi-card metrics-kpi-card-${variant}`}>
      <Card.Body>
        <div className="metrics-kpi-header">
          <span className="metrics-kpi-label">{label}</span>
          {icon && <div className="metrics-kpi-icon">{icon}</div>}
        </div>
        <div className="metrics-kpi-value">{value}</div>
        {badge && (
          <div className="metrics-kpi-badge">
            <Badge bg={badge.variant}>{badge.text}</Badge>
          </div>
        )}
        {footer && (
          <div className="metrics-kpi-footer">
            <small className="text-muted">{footer}</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MetricsKpiCard;
