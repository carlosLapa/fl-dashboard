import React from 'react';
import { Badge } from 'react-bootstrap';
import { getProjetoStatusLabel } from '../../constants/projetoStatus';

interface ProjetoStatusBadgeProps {
  status: string;
  arquivado?: boolean;
}

const ProjetoStatusBadge: React.FC<ProjetoStatusBadgeProps> = ({
  status,
  arquivado = false,
}) => {
  let variant = 'secondary';

  switch (status) {
    case 'ATIVO':
      variant = 'success';
      break;
    case 'EM_PROGRESSO':
      variant = 'primary';
      break;
    case 'CONCLUIDO':
      variant = 'info';
      break;
    case 'SUSPENSO':
      variant = 'warning';
      break;
  }

  return (
    <>
      <Badge bg={variant}>{getProjetoStatusLabel(status)}</Badge>
      {arquivado && (
        <Badge bg="secondary" className="ms-1">
          Arquivado
        </Badge>
      )}
    </>
  );
};

export default ProjetoStatusBadge;
