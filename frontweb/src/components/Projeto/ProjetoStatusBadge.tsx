import React from 'react';
import { Badge } from 'react-bootstrap';

interface ProjetoStatusBadgeProps {
  status: string;
}

const ProjetoStatusBadge: React.FC<ProjetoStatusBadgeProps> = ({ status }) => {
  let variant = 'secondary';
  let displayText = status;

  switch (status) {
    case 'ATIVO':
      variant = 'success';
      displayText = 'Ativo';
      break;
    case 'EM_PROGRESSO':
      variant = 'primary';
      displayText = 'Em Progresso';
      break;
    case 'CONCLUIDO':
      variant = 'info';
      displayText = 'Concluído';
      break;
    case 'SUSPENSO':
      variant = 'warning';
      displayText = 'Suspenso';
      break;
    default:
      displayText = status;
  }

  return <Badge bg={variant}>{displayText}</Badge>;
};

export default ProjetoStatusBadge;
