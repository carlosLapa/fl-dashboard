import React from 'react';
import { Badge } from 'react-bootstrap';

interface TarefaPrioridadeBadgeProps {
  prioridade: string;
}

const TarefaPrioridadeBadge: React.FC<TarefaPrioridadeBadgeProps> = ({
  prioridade,
}) => {
  let variant = 'secondary';
  let displayText = prioridade;

  switch (prioridade) {
    case 'Urgente':
      variant = 'danger';
      displayText = 'Urgente';
      break;
    case 'Alta':
      variant = 'warning';
      displayText = 'Alta';
      break;
    case 'Média':
      variant = 'primary';
      displayText = 'Média';
      break;
    case 'Baixa':
      variant = 'success';
      displayText = 'Baixa';
      break;
    default:
      displayText = prioridade || 'Não definida';
  }

  return <Badge bg={variant}>{displayText}</Badge>;
};

export default TarefaPrioridadeBadge;