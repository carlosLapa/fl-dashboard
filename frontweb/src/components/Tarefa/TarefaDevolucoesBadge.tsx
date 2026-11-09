import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';

interface TarefaDevolucoesBadgeProps {
  tarefaId: number;
  // Times the tarefa was sent back from review (counted by the backend).
  devolucoes?: number;
  className?: string;
}

// Shown on the Kanban card and on the timeline's tarefa rows; renders nothing
// until the tarefa has been sent back at least once.
const TarefaDevolucoesBadge: React.FC<TarefaDevolucoesBadgeProps> = ({
  tarefaId,
  devolucoes,
  className = '',
}) => {
  if (!devolucoes) return null;
  const texto = `Devolvida da revisão ${devolucoes} ${devolucoes === 1 ? 'vez' : 'vezes'}`;
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={`devolucoes-tooltip-${tarefaId}`}>{texto}</Tooltip>}
    >
      <span className={`badge bg-secondary ${className}`} aria-label={texto}>
        <FontAwesomeIcon icon={faRotateLeft} className="me-1" />
        {devolucoes}
      </span>
    </OverlayTrigger>
  );
};

export default TarefaDevolucoesBadge;
