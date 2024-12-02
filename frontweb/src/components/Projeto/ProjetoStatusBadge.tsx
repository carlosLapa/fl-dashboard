import React from 'react';
import { Badge } from 'react-bootstrap';

interface ProjetoStatusBadgeProps {
  status: string;
}

const ProjetoStatusBadge: React.FC<ProjetoStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'primary';
      case 'EM_PROGRESSO':
        return 'warning';
      case 'CONCLUIDO':
        return 'success';
      case 'SUSPENSO':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatStatus = (status: string) => {
    const formattedStatus =
      {
        ATIVO: 'Ativo',
        EM_PROGRESSO: 'Em Progresso',
        CONCLUIDO: 'Concluído',
        SUSPENSO: 'Suspenso',
      }[status] || status;

    return formattedStatus;
  };

  return <Badge bg={getStatusColor(status)}>{formatStatus(status)}</Badge>;
};

export default ProjetoStatusBadge;
