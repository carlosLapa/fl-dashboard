import React from 'react';
import { Badge } from 'react-bootstrap';

interface ProjetoPrioridadeBadgeProps {
  prioridade: string;
}

const ProjetoPrioridadeBadge: React.FC<ProjetoPrioridadeBadgeProps> = ({
  prioridade,
}) => {
  let variant = 'secondary';
  let displayText = prioridade;

  switch (prioridade) {
    case 'URGENTE':
      variant = 'danger';
      displayText = 'Urgente';
      break;
    case 'ALTA':
      variant = 'warning';
      displayText = 'Alta';
      break;
    case 'MEDIA':
      variant = 'primary';
      displayText = 'Média';
      break;
    case 'BAIXA':
      variant = 'success';
      displayText = 'Baixa';
      break;
    case 'EM ESPERA':
      variant = 'secondary';
      displayText = 'Em Espera';
      break;
    default:
      displayText = prioridade || 'Não definida';
  }

  return <Badge bg={variant}>{displayText}</Badge>;
};

export default ProjetoPrioridadeBadge;